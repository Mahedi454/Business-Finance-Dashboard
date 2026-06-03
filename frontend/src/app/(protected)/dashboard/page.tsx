"use client";

import { Activity, Banknote, BriefcaseBusiness, CircleDollarSign, Receipt, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/utils";

type Summary = {
  totalRevenue: number;
  totalInvestment: number;
  totalExpense: number;
  totalSalary: number;
  totalWithdraw: number;
  operationalCost: number;
  netProfit: number;
  currentBalance: number;
  profitStatus: string;
  counts: { clients: number; projects: number; employees: number };
};

type ActivityRow = { id: number; activityType: string; title: string; amount: number; createdAt: string };

const colors = ["#5B4BFF", "#16A34A", "#EF4444", "#F59E0B"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<Record<string, number | string>[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<{ data: Summary }>("/api/dashboard/summary"),
      api<{ data: Record<string, number | string>[] }>("/api/dashboard/monthly-stats"),
      api<{ data: ActivityRow[] }>("/api/dashboard/recent-activity"),
    ]).then(([summaryData, monthlyData, activityData]) => {
      setSummary(summaryData.data);
      setMonthly(monthlyData.data);
      setActivity(activityData.data);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    });
  }, []);

  if (error) return <Card><CardContent className="text-sm font-semibold text-danger">{error}</CardContent></Card>;
  if (!summary) return <Card><CardContent>Loading dashboard...</CardContent></Card>;

  const cards = [
    { label: "Total Revenue", value: summary.totalRevenue, icon: CircleDollarSign, tone: "text-success" },
    { label: "Total Investment", value: summary.totalInvestment, icon: TrendingUp, tone: "text-primary" },
    { label: "Operational Cost", value: summary.operationalCost, icon: Receipt, tone: "text-danger" },
    { label: "Net Profit/Loss", value: summary.netProfit, icon: summary.netProfit >= 0 ? TrendingUp : TrendingDown, tone: summary.netProfit >= 0 ? "text-success" : "text-danger" },
    { label: "Current Balance", value: summary.currentBalance, icon: Banknote, tone: summary.currentBalance >= 0 ? "text-primary" : "text-danger" },
    { label: "Total Withdraw", value: summary.totalWithdraw, icon: Wallet, tone: "text-warning" },
  ];

  const pie = [
    { name: "Revenue", value: summary.totalRevenue },
    { name: "Investment", value: summary.totalInvestment },
    { name: "Expense", value: summary.totalExpense },
    { name: "Salary", value: summary.totalSalary },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <strong className="mt-2 block text-2xl font-extrabold">{formatMoney(card.value)}</strong>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className={summary.netProfit < 0 ? "border-danger" : "border-success"}>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_2fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Profit Status</p>
            <strong className={summary.netProfit < 0 ? "text-3xl font-extrabold text-danger" : "text-3xl font-extrabold text-success"}>{summary.profitStatus}</strong>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Current Balance = Revenue + Investment - Expense - Paid Salary - Withdraw. Investment changes balance only; withdraw changes balance only.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Monthly Financial Summary</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#5B4BFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#5B4BFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Area dataKey="totalRevenue" name="Revenue" stroke="#5B4BFF" fill="url(#revenue)" />
                <Area dataKey="operationalCost" name="Operational Cost" stroke="#EF4444" fill="#EF444422" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Finance Mix</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={65} outerRadius={105} paddingAngle={3}>
                  {pie.map((_, index) => <Cell fill={colors[index]} key={index} />)}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Monthly Profit/Loss</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Bar dataKey="netProfit" name="Net Profit/Loss" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activity.length ? activity.map((item) => (
              <div className="flex gap-3 rounded-md border border-border p-3" key={item.id}>
                <Activity className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.activityType} · {formatMoney(item.amount)}</p>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No activity yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent><Users className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">Clients</p><strong className="text-2xl">{summary.counts.clients}</strong></CardContent></Card>
        <Card><CardContent><BriefcaseBusiness className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">Projects</p><strong className="text-2xl">{summary.counts.projects}</strong></CardContent></Card>
        <Card><CardContent><Users className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">Employees</p><strong className="text-2xl">{summary.counts.employees}</strong></CardContent></Card>
      </div>
    </div>
  );
}
