import { z } from "zod";

export type FieldType = "text" | "email" | "number" | "date" | "month" | "select" | "textarea";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string | number; label: string }[];
};

export type ModuleConfig = {
  title: string;
  singular: string;
  apiPath: string;
  fields: FieldConfig[];
  columns: { key: string; label: string; kind?: "money" | "date" | "progress" }[];
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  defaultValues: Record<string, string | number>;
};

const optionalEmail = z.string().email().or(z.literal(""));
const money = z.coerce.number().nonnegative();
const optionalString = z.string().optional().default("");

export const paymentMethods = [
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "bKash", label: "bKash" },
  { value: "Nagad", label: "Nagad" },
];

export const modules: Record<string, ModuleConfig> = {
  clients: {
    title: "Clients",
    singular: "Client",
    apiPath: "/api/clients",
    schema: z.object({
      clientName: z.string().min(1),
      companyName: optionalString,
      phone: optionalString,
      email: optionalEmail,
      address: optionalString,
      notes: optionalString,
    }),
    defaultValues: { clientName: "", companyName: "", phone: "", email: "", address: "", notes: "" },
    fields: [
      { name: "clientName", label: "Client Name", type: "text" },
      { name: "companyName", label: "Company Name", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "clientName", label: "Name" },
      { key: "companyName", label: "Company" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
    ],
  },
  projects: {
    title: "Projects",
    singular: "Project",
    apiPath: "/api/projects",
    schema: z.object({
      clientId: z.coerce.number().positive(),
      projectName: z.string().min(1),
      dealAmount: money,
      startDate: optionalString,
      deliveryDate: optionalString,
      status: z.enum(["Pending", "InProgress", "Completed"]),
      notes: optionalString,
    }),
    defaultValues: { clientId: "", projectName: "", dealAmount: 0, startDate: "", deliveryDate: "", status: "Pending", notes: "" },
    fields: [
      { name: "clientId", label: "Client", type: "select", options: [] },
      { name: "projectName", label: "Project Name", type: "text" },
      { name: "dealAmount", label: "Deal Amount", type: "number" },
      { name: "startDate", label: "Start Date", type: "date" },
      { name: "deliveryDate", label: "Delivery Date", type: "date" },
      { name: "status", label: "Status", type: "select", options: [{ value: "Pending", label: "Pending" }, { value: "InProgress", label: "In Progress" }, { value: "Completed", label: "Completed" }] },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "projectName", label: "Project" },
      { key: "client.clientName", label: "Client" },
      { key: "dealAmount", label: "Deal", kind: "money" },
      { key: "paymentSummary.paymentProgress", label: "Payment", kind: "progress" },
      { key: "status", label: "Status" },
    ],
  },
  revenue: {
    title: "Revenue",
    singular: "Project Payment",
    apiPath: "/api/project-payments",
    schema: z.object({
      projectId: z.coerce.number().positive(),
      paymentType: z.enum(["AdvancePayment", "MidPayment", "FinalPayment"]),
      amount: money,
      paymentDate: z.string().min(1),
      paymentMethod: z.enum(["Cash", "Bank", "bKash", "Nagad"]),
      transactionNote: optionalString,
    }),
    defaultValues: { projectId: "", paymentType: "AdvancePayment", amount: 0, paymentDate: "", paymentMethod: "Cash", transactionNote: "" },
    fields: [
      { name: "projectId", label: "Project", type: "select", options: [] },
      { name: "paymentType", label: "Payment Type", type: "select", options: [{ value: "AdvancePayment", label: "Advance Payment" }, { value: "MidPayment", label: "Mid Payment" }, { value: "FinalPayment", label: "Final Payment" }] },
      { name: "amount", label: "Amount", type: "number" },
      { name: "paymentDate", label: "Payment Date", type: "date" },
      { name: "paymentMethod", label: "Payment Method", type: "select", options: paymentMethods },
      { name: "transactionNote", label: "Transaction Note", type: "textarea" },
    ],
    columns: [
      { key: "project.projectName", label: "Project" },
      { key: "paymentType", label: "Type" },
      { key: "amount", label: "Amount", kind: "money" },
      { key: "paymentMethod", label: "Method" },
      { key: "paymentDate", label: "Date", kind: "date" },
    ],
  },
  investments: {
    title: "Investments",
    singular: "Investment",
    apiPath: "/api/investments",
    schema: z.object({ investorName: z.string().min(1), amount: money, investmentDate: z.string().min(1), paymentMethod: z.enum(["Cash", "Bank", "bKash", "Nagad"]), note: optionalString }),
    defaultValues: { investorName: "", amount: 0, investmentDate: "", paymentMethod: "Cash", note: "" },
    fields: [
      { name: "investorName", label: "Investor Name", type: "text" },
      { name: "amount", label: "Amount", type: "number" },
      { name: "investmentDate", label: "Investment Date", type: "date" },
      { name: "paymentMethod", label: "Payment Method", type: "select", options: paymentMethods },
      { name: "note", label: "Note", type: "textarea" },
    ],
    columns: [{ key: "investorName", label: "Investor" }, { key: "amount", label: "Amount", kind: "money" }, { key: "paymentMethod", label: "Method" }, { key: "investmentDate", label: "Date", kind: "date" }],
  },
  expenses: {
    title: "Expenses",
    singular: "Expense",
    apiPath: "/api/expenses",
    schema: z.object({ expenseTitle: z.string().min(1), category: z.enum(["Hosting", "Domain", "Marketing", "SoftwareTools", "Salary", "Equipment", "Miscellaneous"]), amount: money, expenseDate: z.string().min(1), paidBy: optionalString, receiptUrl: optionalString, note: optionalString }),
    defaultValues: { expenseTitle: "", category: "Hosting", amount: 0, expenseDate: "", paidBy: "", receiptUrl: "", note: "" },
    fields: [
      { name: "expenseTitle", label: "Expense Title", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["Hosting", "Domain", "Marketing", "SoftwareTools", "Salary", "Equipment", "Miscellaneous"].map((value) => ({ value, label: value === "SoftwareTools" ? "Software Tools" : value })) },
      { name: "amount", label: "Amount", type: "number" },
      { name: "expenseDate", label: "Expense Date", type: "date" },
      { name: "paidBy", label: "Paid By", type: "text" },
      { name: "receiptUrl", label: "Receipt URL", type: "text" },
      { name: "note", label: "Note", type: "textarea" },
    ],
    columns: [{ key: "expenseTitle", label: "Title" }, { key: "category", label: "Category" }, { key: "amount", label: "Amount", kind: "money" }, { key: "paidBy", label: "Paid By" }, { key: "expenseDate", label: "Date", kind: "date" }],
  },
  employees: {
    title: "Employees",
    singular: "Employee",
    apiPath: "/api/employees",
    schema: z.object({ employeeName: z.string().min(1), role: z.string().min(1), phone: optionalString, email: optionalEmail, joiningDate: optionalString, salary: money, status: z.enum(["Active", "Inactive"]) }),
    defaultValues: { employeeName: "", role: "", phone: "", email: "", joiningDate: "", salary: 0, status: "Active" },
    fields: [
      { name: "employeeName", label: "Employee Name", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "joiningDate", label: "Joining Date", type: "date" },
      { name: "salary", label: "Salary", type: "number" },
      { name: "status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
    ],
    columns: [{ key: "employeeName", label: "Name" }, { key: "role", label: "Role" }, { key: "phone", label: "Phone" }, { key: "salary", label: "Salary", kind: "money" }, { key: "status", label: "Status" }],
  },
  salaries: {
    title: "Salaries",
    singular: "Salary",
    apiPath: "/api/salaries",
    schema: z.object({ employeeId: z.coerce.number().positive(), month: z.string().min(1), salaryAmount: money, bonus: money, deduction: money, totalPaid: money, paymentDate: optionalString, paymentStatus: z.enum(["Paid", "Unpaid"]) }),
    defaultValues: { employeeId: "", month: "", salaryAmount: 0, bonus: 0, deduction: 0, totalPaid: 0, paymentDate: "", paymentStatus: "Unpaid" },
    fields: [
      { name: "employeeId", label: "Employee", type: "select", options: [] },
      { name: "month", label: "Month", type: "month" },
      { name: "salaryAmount", label: "Salary Amount", type: "number" },
      { name: "bonus", label: "Bonus", type: "number" },
      { name: "deduction", label: "Deduction", type: "number" },
      { name: "totalPaid", label: "Total Paid", type: "number" },
      { name: "paymentDate", label: "Payment Date", type: "date" },
      { name: "paymentStatus", label: "Payment Status", type: "select", options: [{ value: "Paid", label: "Paid" }, { value: "Unpaid", label: "Unpaid" }] },
    ],
    columns: [{ key: "employee.employeeName", label: "Employee" }, { key: "month", label: "Month" }, { key: "totalPaid", label: "Total Paid", kind: "money" }, { key: "paymentStatus", label: "Status" }, { key: "paymentDate", label: "Date", kind: "date" }],
  },
  withdraws: {
    title: "Withdraws",
    singular: "Withdrawal",
    apiPath: "/api/withdrawals",
    schema: z.object({ withdrawBy: z.string().min(1), amount: money, withdrawDate: z.string().min(1), paymentMethod: z.enum(["Cash", "Bank", "bKash", "Nagad"]), note: optionalString }),
    defaultValues: { withdrawBy: "", amount: 0, withdrawDate: "", paymentMethod: "Cash", note: "" },
    fields: [
      { name: "withdrawBy", label: "Withdraw By", type: "text" },
      { name: "amount", label: "Amount", type: "number" },
      { name: "withdrawDate", label: "Withdraw Date", type: "date" },
      { name: "paymentMethod", label: "Payment Method", type: "select", options: paymentMethods },
      { name: "note", label: "Note", type: "textarea" },
    ],
    columns: [{ key: "withdrawBy", label: "Withdraw By" }, { key: "amount", label: "Amount", kind: "money" }, { key: "paymentMethod", label: "Method" }, { key: "withdrawDate", label: "Date", kind: "date" }],
  },
};

export const labelMap: Record<string, string> = {
  InProgress: "In Progress",
  AdvancePayment: "Advance Payment",
  MidPayment: "Mid Payment",
  FinalPayment: "Final Payment",
  SoftwareTools: "Software Tools",
};

export function getPathValue(row: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, row);
}
