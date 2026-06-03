CREATE TYPE "ProjectStatus" AS ENUM ('Pending', 'InProgress', 'Completed');
CREATE TYPE "PaymentType" AS ENUM ('AdvancePayment', 'MidPayment', 'FinalPayment');
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Bank', 'bKash', 'Nagad');
CREATE TYPE "ExpenseCategory" AS ENUM ('Hosting', 'Domain', 'Marketing', 'SoftwareTools', 'Salary', 'Equipment', 'Miscellaneous');
CREATE TYPE "EmployeeStatus" AS ENUM ('Active', 'Inactive');
CREATE TYPE "SalaryPaymentStatus" AS ENUM ('Paid', 'Unpaid');

CREATE TABLE "AdminUser" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
  "id" SERIAL NOT NULL,
  "clientName" TEXT NOT NULL,
  "companyName" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
  "id" SERIAL NOT NULL,
  "clientId" INTEGER NOT NULL,
  "projectName" TEXT NOT NULL,
  "dealAmount" DECIMAL(12,2) NOT NULL,
  "startDate" TIMESTAMP(3),
  "deliveryDate" TIMESTAMP(3),
  "status" "ProjectStatus" NOT NULL DEFAULT 'Pending',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectPayment" (
  "id" SERIAL NOT NULL,
  "projectId" INTEGER NOT NULL,
  "paymentType" "PaymentType" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "transactionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Investment" (
  "id" SERIAL NOT NULL,
  "investorName" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "investmentDate" TIMESTAMP(3) NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
  "id" SERIAL NOT NULL,
  "expenseTitle" TEXT NOT NULL,
  "category" "ExpenseCategory" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "expenseDate" TIMESTAMP(3) NOT NULL,
  "paidBy" TEXT,
  "receiptUrl" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Employee" (
  "id" SERIAL NOT NULL,
  "employeeName" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "joiningDate" TIMESTAMP(3),
  "salary" DECIMAL(12,2) NOT NULL,
  "status" "EmployeeStatus" NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Salary" (
  "id" SERIAL NOT NULL,
  "employeeId" INTEGER NOT NULL,
  "month" TEXT NOT NULL,
  "salaryAmount" DECIMAL(12,2) NOT NULL,
  "bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "deduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "totalPaid" DECIMAL(12,2) NOT NULL,
  "paymentDate" TIMESTAMP(3),
  "paymentStatus" "SalaryPaymentStatus" NOT NULL DEFAULT 'Unpaid',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Withdrawal" (
  "id" SERIAL NOT NULL,
  "withdrawBy" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "withdrawDate" TIMESTAMP(3) NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityLog" (
  "id" SERIAL NOT NULL,
  "activityType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "ProjectPayment_projectId_idx" ON "ProjectPayment"("projectId");
CREATE INDEX "ProjectPayment_paymentDate_idx" ON "ProjectPayment"("paymentDate");
CREATE INDEX "Investment_investmentDate_idx" ON "Investment"("investmentDate");
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");
CREATE INDEX "Salary_employeeId_idx" ON "Salary"("employeeId");
CREATE INDEX "Salary_month_idx" ON "Salary"("month");
CREATE INDEX "Salary_paymentDate_idx" ON "Salary"("paymentDate");
CREATE INDEX "Withdrawal_withdrawDate_idx" ON "Withdrawal"("withdrawDate");

ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectPayment" ADD CONSTRAINT "ProjectPayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
