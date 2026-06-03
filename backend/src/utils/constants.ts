export const AUTH_COOKIE = "business_finance_dashboard_token";

export const enumLabels = {
  ProjectStatus: {
    Pending: "Pending",
    InProgress: "In Progress",
    Completed: "Completed",
  },
  PaymentType: {
    AdvancePayment: "Advance Payment",
    MidPayment: "Mid Payment",
    FinalPayment: "Final Payment",
  },
  PaymentMethod: {
    Cash: "Cash",
    Bank: "Bank",
    bKash: "bKash",
    Nagad: "Nagad",
  },
  ExpenseCategory: {
    Hosting: "Hosting",
    Domain: "Domain",
    Marketing: "Marketing",
    SoftwareTools: "Software Tools",
    Salary: "Salary",
    Equipment: "Equipment",
    Miscellaneous: "Miscellaneous",
  },
  EmployeeStatus: {
    Active: "Active",
    Inactive: "Inactive",
  },
  SalaryPaymentStatus: {
    Paid: "Paid",
    Unpaid: "Unpaid",
  },
} as const;

export type ProjectPaymentStatus = "Unpaid" | "Partially Paid" | "Paid";
export type ProfitStatus = "Profit" | "Loss" | "Break Even";
