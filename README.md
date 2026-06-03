# Business Finance Dashboard

Modern full-stack rebuild of the legacy PHP/MySQL finance dashboard.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Shadcn-style UI components, React Hook Form, Zod, Recharts
- Backend: Express.js, TypeScript, PostgreSQL, Prisma ORM, Zod
- Auth: demo admin login with secure HTTP-only JWT cookie

Demo login:

```txt
Email: admin@finance.com
Password: admin1234
```

## Structure

```txt
Business Finance Dashboard/
├── frontend/
└── backend/
```

Each app has its own `package.json`, `package-lock.json`, and `node_modules` folder. There is no root workspace package.

## Financial Logic

- Investment is not revenue.
- Withdraw is not expense.
- Revenue affects profit and balance.
- Investment affects balance only.
- Expense affects profit and balance.
- Salary affects profit and balance.
- Withdraw affects balance only.

Formulas:

```txt
Total Revenue = sum(ProjectPayment.amount)
Total Investment = sum(Investment.amount)
Total Expense = sum(Expense.amount)
Total Salary = sum(Salary.totalPaid where paymentStatus = Paid)
Total Withdraw = sum(Withdrawal.amount)
Operational Cost = Total Expense + Total Salary
Net Profit/Loss = Total Revenue - Operational Cost
Current Balance = Total Revenue + Total Investment - Total Expense - Total Salary - Total Withdraw
```

Project payment status:

```txt
Total Paid = sum(ProjectPayment.amount where projectId = current project)
Due Amount = Project.dealAmount - Total Paid
Payment Progress = Total Paid / Project.dealAmount * 100
```

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Configure backend:

```bash
cd backend
cp .env.example .env
```

Set `DATABASE_URL` to a PostgreSQL database.

4. Configure frontend:

```bash
cd frontend
cp .env.example .env.local
```

5. Create tables and demo admin:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

6. Run backend:

```bash
cd backend
npm run dev
```

7. Run frontend:

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

## API Routes

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/monthly-stats`
- `GET /api/dashboard/recent-activity`

CRUD:

- `/api/clients`
- `/api/projects`
- `/api/project-payments`
- `/api/investments`
- `/api/expenses`
- `/api/employees`
- `/api/salaries`
- `/api/withdrawals`
- `/api/reports`

All dashboard and module routes are protected by `requireAuth`.

## Deployment

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Environment: `NEXT_PUBLIC_API_URL=https://api.business-finance-dashboard.com`

Backend on Render/Railway:

- Root directory: `backend`
- Build command: `npm install && npm run build && npm run prisma:deploy`
- Start command: `npm run start`
- Environment:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL=https://business-finance-dashboard.com`
  - `COOKIE_DOMAIN=.business-finance-dashboard.com`
  - `NODE_ENV=production`

Database:

- Use PostgreSQL from Supabase, Neon, Railway, or Render.
- Run `npm run prisma:deploy` inside `backend` during deployment.
- Run `npm run prisma:seed` inside `backend` once to create the demo admin.
