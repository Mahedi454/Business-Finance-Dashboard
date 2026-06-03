import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { getFinancialTotals, monthlyStats } from "../utils/finance.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res, next) => {
  try {
    const totals = await getFinancialTotals();
    const [clients, projects, employees] = await Promise.all([
      prisma.client.count(),
      prisma.project.count(),
      prisma.employee.count(),
    ]);
    res.json({ data: { ...totals, counts: { clients, projects, employees } } });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/monthly-stats", async (_req, res, next) => {
  try {
    res.json({ data: await monthlyStats() });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/recent-activity", async (_req, res, next) => {
  try {
    const data = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});
