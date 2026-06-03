import { z } from "zod";
import { common } from "./common.js";

export const clientSchema = z.object({
  clientName: common.requiredText,
  companyName: common.optionalText,
  phone: common.optionalText,
  email: z.string().email().optional().or(z.literal("")).transform((value) => value || null),
  address: common.optionalText,
  notes: common.optionalText,
});

export const projectSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  projectName: common.requiredText,
  dealAmount: common.money,
  startDate: common.optionalDateValue,
  deliveryDate: common.optionalDateValue,
  status: z.enum(["Pending", "InProgress", "Completed"]).default("Pending"),
  notes: common.optionalText,
});

export const projectPaymentSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  paymentType: z.enum(["AdvancePayment", "MidPayment", "FinalPayment"]),
  amount: common.money,
  paymentDate: common.dateValue,
  paymentMethod: z.enum(["Cash", "Bank", "bKash", "Nagad"]),
  transactionNote: common.optionalText,
});

export const investmentSchema = z.object({
  investorName: common.requiredText,
  amount: common.money,
  investmentDate: common.dateValue,
  paymentMethod: z.enum(["Cash", "Bank", "bKash", "Nagad"]),
  note: common.optionalText,
});

export const expenseSchema = z.object({
  expenseTitle: common.requiredText,
  category: z.enum(["Hosting", "Domain", "Marketing", "SoftwareTools", "Salary", "Equipment", "Miscellaneous"]),
  amount: common.money,
  expenseDate: common.dateValue,
  paidBy: common.optionalText,
  receiptUrl: common.optionalText,
  note: common.optionalText,
});

export const employeeSchema = z.object({
  employeeName: common.requiredText,
  role: common.requiredText,
  phone: common.optionalText,
  email: z.string().email().optional().or(z.literal("")).transform((value) => value || null),
  joiningDate: common.optionalDateValue,
  salary: common.money,
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const salarySchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  salaryAmount: common.money,
  bonus: common.money.default(0),
  deduction: common.money.default(0),
  totalPaid: common.money,
  paymentDate: common.optionalDateValue,
  paymentStatus: z.enum(["Paid", "Unpaid"]).default("Unpaid"),
});

export const withdrawalSchema = z.object({
  withdrawBy: common.requiredText,
  amount: common.money,
  withdrawDate: common.dateValue,
  paymentMethod: z.enum(["Cash", "Bank", "bKash", "Nagad"]),
  note: common.optionalText,
});

export const reportQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.enum(["summary", "revenue", "expense", "investment", "salary", "profit"]).default("summary"),
});
