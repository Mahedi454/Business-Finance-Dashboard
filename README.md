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

## Free Deployment

Vercel can host both the Next.js frontend and the Express backend for free on `*.vercel.app` domains. The backend runs as Vercel serverless functions, and PostgreSQL still needs to be hosted separately.

### Frontend on Vercel

1. Push this repository to GitHub.
2. In Vercel, create a new project from the GitHub repo.
3. Set the project root directory to `frontend`.
4. Use these build settings:

```txt
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

5. Add this environment variable after the backend is deployed:

```txt
NEXT_PUBLIC_API_URL=https://your-backend-domain.example.com
```

Vercel will give the frontend a free domain like:

```txt
https://business-finance-dashboard.vercel.app
```

You can add a custom domain in Vercel later, but buying/registering a custom domain is not free. The free domain is the Vercel subdomain.

### Backend on Vercel

Create a second Vercel project from the same GitHub repo for the backend.

Backend settings:

```txt
Root Directory: backend
Framework Preset: Other
Install Command: npm install
Build Command: npm run vercel-build
Output Directory: leave empty
```

Backend environment variables:

```txt
DATABASE_URL=postgresql://...
JWT_SECRET=use-a-long-random-secret-at-least-16-characters
FRONTEND_URL=https://your-vercel-app.vercel.app
COOKIE_DOMAIN=
NODE_ENV=production
```

Leave `COOKIE_DOMAIN` empty when using different free Vercel subdomains for the frontend and backend.

The backend will get a free URL like:

```txt
https://business-finance-dashboard-backend.vercel.app
```

Use that URL in the frontend Vercel project:

```txt
NEXT_PUBLIC_API_URL=https://business-finance-dashboard-backend.vercel.app
```

### Database

PostgreSQL is still separate from Vercel:

- Use PostgreSQL from Supabase, Neon, Railway, Render, or another hosted Postgres provider.
- The backend Vercel build runs `prisma migrate deploy` automatically.
- Run `npm run prisma:seed` once against the production database to create the demo admin.
- Keep `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` in backend environment variables if you want a different first admin account.
