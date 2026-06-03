import { z } from "zod";

const optionalText = z.string().trim().optional().nullable().transform((value) => value || null);
const requiredText = z.string().trim().min(1);
const dateValue = z.string().min(1).transform((value) => new Date(value));
const optionalDateValue = z.string().optional().nullable().transform((value) => (value ? new Date(value) : null));
const money = z.coerce.number().nonnegative();

export const common = {
  optionalText,
  requiredText,
  dateValue,
  optionalDateValue,
  money,
};

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional().default(""),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
