import { Router } from "express";
import { reportQuerySchema } from "../schemas/modules.js";
import { dateRangeWhere, getFinancialTotals, monthlyStats } from "../utils/finance.js";

export const reportsRouter = Router();

const reportRows = (summary: Awaited<ReturnType<typeof getFinancialTotals>>) => [
  { section: "Income", label: "Client Revenue", amount: summary.totalRevenue, note: "Project payments received" },
  { section: "Balance Only", label: "Investment", amount: summary.totalInvestment, note: "Investment affects balance, not profit" },
  { section: "Costs", label: "Expense", amount: -summary.totalExpense, note: "Expense affects profit and balance" },
  { section: "Costs", label: "Salary Cost", amount: -summary.totalSalary, note: "Only salaries marked paid" },
  { section: "Costs", label: "Operational Cost", amount: -summary.operationalCost, note: "Expense + paid salary" },
  { section: "Result", label: "Net Profit/Loss", amount: summary.netProfit, note: "Revenue - operational cost" },
  { section: "Balance Only", label: "Withdraw", amount: -summary.totalWithdraw, note: "Withdraw affects balance, not profit" },
  { section: "Balance", label: "Current Balance", amount: summary.currentBalance, note: "Revenue + investment - expense - salary - withdraw" },
];

reportsRouter.get("/", async (req, res, next) => {
  try {
    const query = reportQuerySchema.parse(req.query);
    const summary = await getFinancialTotals({
      revenue: dateRangeWhere("paymentDate", query.from, query.to),
      investment: dateRangeWhere("investmentDate", query.from, query.to),
      expense: dateRangeWhere("expenseDate", query.from, query.to),
      salary: dateRangeWhere("paymentDate", query.from, query.to),
      withdraw: dateRangeWhere("withdrawDate", query.from, query.to),
    });
    const rows = reportRows(summary);
    const filtered = {
      revenue: rows.filter((row) => row.label === "Client Revenue"),
      expense: rows.filter((row) => ["Expense", "Salary Cost", "Operational Cost"].includes(row.label)),
      investment: rows.filter((row) => row.label === "Investment"),
      salary: rows.filter((row) => row.label === "Salary Cost"),
      profit: rows.filter((row) => ["Client Revenue", "Operational Cost", "Net Profit/Loss"].includes(row.label)),
      summary: rows,
    }[query.type];

    res.json({
      data: {
        type: query.type,
        from: query.from,
        to: query.to,
        summary,
        rows: filtered,
        monthly: await monthlyStats(),
      },
    });
  } catch (error) {
    next(error);
  }
});
