import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase text-slate-500">Settings</p>
        <h2 className="text-2xl font-extrabold">Application Settings</h2>
      </div>
      <Card>
        <CardHeader><CardTitle>Demo Authentication</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 rounded-md border border-border p-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Protected finance workspace</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">All dashboard pages and backend API routes require the JWT cookie created during login. Public registration is disabled.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border p-4"><p className="text-sm text-slate-500">Frontend Domain</p><strong>business-finance-dashboard.com</strong></div>
            <div className="rounded-md border border-border p-4"><p className="text-sm text-slate-500">Backend API Domain</p><strong>api.business-finance-dashboard.com</strong></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
