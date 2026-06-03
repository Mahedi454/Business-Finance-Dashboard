import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { createCrudRouter } from "./crud.js";
import {
  clientSchema,
  employeeSchema,
  expenseSchema,
  investmentSchema,
  projectPaymentSchema,
  projectSchema,
  salarySchema,
  withdrawalSchema,
} from "../schemas/modules.js";
import { getProjectPaymentSummary } from "../utils/finance.js";

export const modulesRouter = Router();

modulesRouter.use(
  "/clients",
  createCrudRouter(prisma, {
    model: "client",
    schema: clientSchema,
    searchFields: ["clientName", "companyName", "phone", "email"],
    activityType: "Client",
    activityTitle: (data) => String(data.clientName),
  })
);

modulesRouter.use(
  "/projects",
  createCrudRouter(prisma, {
    model: "project",
    schema: projectSchema,
    searchFields: ["projectName", "notes"],
    include: { client: true, projectPayments: true },
    activityType: "Project",
    activityTitle: (data) => String(data.projectName),
    activityAmount: (data) => Number(data.dealAmount ?? 0),
    afterReadMany: async (items) =>
      Promise.all(
        items.map(async (item) => ({
          ...(item as object),
          paymentSummary: await getProjectPaymentSummary(Number((item as { id: number }).id), Number((item as { dealAmount: unknown }).dealAmount)),
        }))
      ),
    afterReadOne: async (item) => ({
      ...(item as object),
      paymentSummary: await getProjectPaymentSummary(Number((item as { id: number }).id), Number((item as { dealAmount: unknown }).dealAmount)),
    }),
  })
);

modulesRouter.use(
  "/project-payments",
  createCrudRouter(prisma, {
    model: "projectPayment",
    schema: projectPaymentSchema,
    searchFields: ["transactionNote"],
    include: { project: { include: { client: true } } },
    activityType: "Project Payment",
    activityTitle: (data) => `Payment for project #${data.projectId}`,
    activityAmount: (data) => Number(data.amount ?? 0),
  })
);

modulesRouter.use(
  "/investments",
  createCrudRouter(prisma, {
    model: "investment",
    schema: investmentSchema,
    searchFields: ["investorName", "paymentMethod", "note"],
    activityType: "Investment",
    activityTitle: (data) => String(data.investorName),
    activityAmount: (data) => Number(data.amount ?? 0),
  })
);

modulesRouter.use(
  "/expenses",
  createCrudRouter(prisma, {
    model: "expense",
    schema: expenseSchema,
    searchFields: ["expenseTitle", "paidBy", "note"],
    activityType: "Expense",
    activityTitle: (data) => String(data.expenseTitle),
    activityAmount: (data) => Number(data.amount ?? 0),
  })
);

modulesRouter.use(
  "/employees",
  createCrudRouter(prisma, {
    model: "employee",
    schema: employeeSchema,
    searchFields: ["employeeName", "role", "phone", "email"],
    activityType: "Employee",
    activityTitle: (data) => String(data.employeeName),
    activityAmount: (data) => Number(data.salary ?? 0),
  })
);

modulesRouter.use(
  "/salaries",
  createCrudRouter(prisma, {
    model: "salary",
    schema: salarySchema,
    searchFields: ["month"],
    include: { employee: true },
    activityType: "Salary",
    activityTitle: (data) => `Salary ${data.month}`,
    activityAmount: (data) => Number(data.totalPaid ?? 0),
  })
);

modulesRouter.use(
  "/withdrawals",
  createCrudRouter(prisma, {
    model: "withdrawal",
    schema: withdrawalSchema,
    searchFields: ["withdrawBy", "paymentMethod", "note"],
    activityType: "Withdrawal",
    activityTitle: (data) => String(data.withdrawBy),
    activityAmount: (data) => Number(data.amount ?? 0),
  })
);
