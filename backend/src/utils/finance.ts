import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type { ProfitStatus, ProjectPaymentStatus } from "./constants.js";

const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
  value ? Number(value) : 0;

export function profitStatus(netProfit: number): ProfitStatus {
  if (netProfit > 0) return "Profit";
  if (netProfit < 0) return "Loss";
  return "Break Even";
}

export function projectPaymentStatus(totalPaid: number, dealAmount: number): ProjectPaymentStatus {
  if (totalPaid <= 0) return "Unpaid";
  if (totalPaid < dealAmount) return "Partially Paid";
  return "Paid";
}

export async function getFinancialTotals(where?: {
  revenue?: Prisma.ProjectPaymentWhereInput;
  investment?: Prisma.InvestmentWhereInput;
  expense?: Prisma.ExpenseWhereInput;
  salary?: Prisma.SalaryWhereInput;
  withdraw?: Prisma.WithdrawalWhereInput;
}) {
  const [revenue, investment, expense, salary, withdraw] = await Promise.all([
    prisma.projectPayment.aggregate({ _sum: { amount: true }, where: where?.revenue }),
    prisma.investment.aggregate({ _sum: { amount: true }, where: where?.investment }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: where?.expense }),
    prisma.salary.aggregate({
      _sum: { totalPaid: true },
      where: { paymentStatus: "Paid", ...where?.salary },
    }),
    prisma.withdrawal.aggregate({ _sum: { amount: true }, where: where?.withdraw }),
  ]);

  const totalRevenue = toNumber(revenue._sum.amount);
  const totalInvestment = toNumber(investment._sum.amount);
  const totalExpense = toNumber(expense._sum.amount);
  const totalSalary = toNumber(salary._sum.totalPaid);
  const totalWithdraw = toNumber(withdraw._sum.amount);
  const operationalCost = totalExpense + totalSalary;
  const netProfit = totalRevenue - operationalCost;
  const currentBalance = totalRevenue + totalInvestment - totalExpense - totalSalary - totalWithdraw;

  return {
    totalRevenue,
    totalInvestment,
    totalExpense,
    totalSalary,
    totalWithdraw,
    operationalCost,
    netProfit,
    currentBalance,
    profitStatus: profitStatus(netProfit),
  };
}

export async function getProjectPaymentSummary(projectId: number, dealAmount: number) {
  const aggregate = await prisma.projectPayment.aggregate({
    _sum: { amount: true },
    where: { projectId },
  });
  const totalPaid = toNumber(aggregate._sum.amount);
  const dueAmount = Math.max(0, dealAmount - totalPaid);
  const paymentProgress = dealAmount > 0 ? Math.min(100, (totalPaid / dealAmount) * 100) : 0;

  return {
    totalPaid,
    dueAmount,
    paymentProgress,
    paymentStatus: projectPaymentStatus(totalPaid, dealAmount),
  };
}

export function dateRangeWhere(field: string, from?: string, to?: string) {
  if (!from && !to) return undefined;
  const toDate = to ? new Date(to) : undefined;
  if (toDate) toDate.setHours(23, 59, 59, 999);

  return {
    [field]: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(toDate ? { lte: toDate } : {}),
    },
  };
}

export async function monthlyStats(months = 12) {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const series = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const from = new Date(startMonth.getFullYear(), startMonth.getMonth() - index, 1);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0, 23, 59, 59, 999);
    const totals = await getFinancialTotals({
      revenue: { paymentDate: { gte: from, lte: to } },
      investment: { investmentDate: { gte: from, lte: to } },
      expense: { expenseDate: { gte: from, lte: to } },
      salary: { paymentDate: { gte: from, lte: to } },
      withdraw: { withdrawDate: { gte: from, lte: to } },
    });

    series.push({
      label: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`,
      ...totals,
    });
  }

  return series;
}
