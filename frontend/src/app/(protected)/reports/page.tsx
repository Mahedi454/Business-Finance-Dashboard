"use client";

import { Download, FileBarChart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { downloadReportPdf } from "@/lib/report-pdf";
import { formatMoney } from "@/lib/utils";

type Report = {
  summary: { netProfit: number; currentBalance: number; profitStatus: string; totalRevenue: number };
  rows: { section: string; label: string; note: string; amount: number }[];
  monthly: Record<string, number | string>[];
};

export default function ReportsPage() {
  const today = new Date();
  const [type, setType] = useState("summary");
  const [from, setFrom] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`);
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ type, from, to });
      const result = await api<{ data: Report }>(`/api/reports?${params.toString()}`);
      setReport(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-slate-500">Reports</p>
        <h2 className="text-2xl font-extrabold">Financial Reports</h2>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div><label className="mb-2 block text-sm font-semibold">Report Type</label><Select value={type} onChange={(event) => setType(event.target.value)}><option value="summary">Monthly Financial Summary</option><option value="revenue">Revenue Report</option><option value="expense">Expense Report</option><option value="investment">Investment Report</option><option value="salary">Salary Report</option><option value="profit">Profit/Loss Report</option></Select></div>
          <div><label className="mb-2 block text-sm font-semibold">From</label><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
          <div><label className="mb-2 block text-sm font-semibold">To</label><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div>
          <div className="flex gap-2">
            <Button disabled={loading} onClick={load}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBarChart className="h-4 w-4" />}
              {loading ? "Generating..." : "Generate"}
            </Button>
            <Button disabled={!report || loading} variant="secondary" onClick={() => report && downloadReportPdf(report, { type, from, to })}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}

      {report && (
        <>
          <div className="animate-report-in grid gap-4 md:grid-cols-3">
            <Card><CardContent><p className="text-sm text-slate-500">Revenue</p><strong className="text-2xl">{formatMoney(report.summary.totalRevenue)}</strong></CardContent></Card>
            <Card><CardContent><p className="text-sm text-slate-500">Net Profit/Loss</p><strong className={report.summary.netProfit >= 0 ? "text-2xl text-success" : "text-2xl text-danger"}>{formatMoney(report.summary.netProfit)}</strong></CardContent></Card>
            <Card><CardContent><p className="text-sm text-slate-500">Current Balance</p><strong className="text-2xl">{formatMoney(report.summary.currentBalance)}</strong></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Report Rows</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <thead><tr><Th>Section</Th><Th>Item</Th><Th>Note</Th><Th className="text-right">Amount</Th></tr></thead>
                  <tbody>
                    {report.rows.map((row, index) => (
                      <tr key={`${row.section}-${row.label}-${index}`}><Td>{row.section}</Td><Td className="font-semibold">{row.label}</Td><Td>{row.note}</Td><Td className={row.amount < 0 ? "text-right font-bold text-danger" : "text-right font-bold text-success"}>{formatMoney(row.amount)}</Td></tr>
                    ))}
                    {!report.rows.length && <tr><Td className="text-slate-500" colSpan={4}>No report rows found for this date range.</Td></tr>}
                  </tbody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Monthly Financial Summary</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.monthly}>
                  <CartesianGrid stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Bar dataKey="totalRevenue" name="Revenue" fill="#5B4BFF" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="operationalCost" name="Operational Cost" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
