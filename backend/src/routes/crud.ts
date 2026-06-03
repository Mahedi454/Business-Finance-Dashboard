import { Router } from "express";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { AnyZodObject } from "zod";
import { idParamSchema, listQuerySchema } from "../schemas/common.js";
import { ApiError } from "../middleware/error.js";
import { logActivity } from "../utils/activity.js";

type Delegate = {
  findMany(args: Record<string, unknown>): Promise<unknown[]>;
  count(args: Record<string, unknown>): Promise<number>;
  findUnique(args: Record<string, unknown>): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
};

type CrudOptions = {
  model: keyof PrismaClient;
  schema: AnyZodObject;
  searchFields: string[];
  include?: Record<string, unknown>;
  orderBy?: Record<string, string>;
  activityType: string;
  activityTitle: (data: Record<string, unknown>) => string;
  activityAmount?: (data: Record<string, unknown>) => number;
  afterReadMany?: (items: unknown[]) => Promise<unknown[]> | unknown[];
  afterReadOne?: (item: unknown) => Promise<unknown> | unknown;
};

const buildSearchWhere = (search: string, fields: string[]) => {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    })),
  };
};

export function createCrudRouter(prisma: PrismaClient, options: CrudOptions) {
  const router = Router();
  const delegate = prisma[options.model] as Delegate;

  router.get("/", async (req, res, next) => {
    try {
      const query = listQuerySchema.parse(req.query);
      const skip = (query.page - 1) * query.limit;
      const where = buildSearchWhere(query.search, options.searchFields);
      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          include: options.include,
          orderBy: options.orderBy ?? { createdAt: "desc" },
          skip,
          take: query.limit,
        }),
        delegate.count({ where }),
      ]);
      const data = options.afterReadMany ? await options.afterReadMany(items) : items;
      res.json({ data, meta: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const item = await delegate.findUnique({ where: { id }, include: options.include });
      if (!item) throw new ApiError(404, "Record not found");
      res.json({ data: options.afterReadOne ? await options.afterReadOne(item) : item });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = options.schema.parse(req.body);
      const item = await delegate.create({ data, include: options.include });
      await logActivity(options.activityType, options.activityTitle(data), options.activityAmount?.(data) ?? 0);
      res.status(201).json({ data: options.afterReadOne ? await options.afterReadOne(item) : item });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = options.schema.parse(req.body);
      const item = await delegate.update({ where: { id }, data, include: options.include });
      await logActivity(`${options.activityType} Updated`, options.activityTitle(data), options.activityAmount?.(data) ?? 0);
      res.json({ data: options.afterReadOne ? await options.afterReadOne(item) : item });
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") return next(new ApiError(404, "Record not found"));
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await delegate.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") return next(new ApiError(404, "Record not found"));
      next(error);
    }
  });

  return router;
}
