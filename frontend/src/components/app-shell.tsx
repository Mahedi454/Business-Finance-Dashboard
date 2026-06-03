"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  CreditCard,
  Home,
  Landmark,
  LogOut,
  Menu,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/revenue", label: "Revenue", icon: CircleDollarSign },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/salaries", label: "Salaries", icon: CreditCard },
  { href: "/withdraws", label: "Withdraws", icon: Wallet },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = navItems.find((item) => pathname.startsWith(item.href));

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <Image alt="Business Finance Dashboard" className="h-10 w-10 object-contain" height={40} src="/logo.png" width={40} />
          <div>
            <p className="text-xs font-semibold uppercase text-white/55">Business</p>
            <strong className="text-lg">Finance Dashboard</strong>
          </div>
        </div>
        <Button aria-label="Close menu" className="md:hidden" size="icon" variant="ghost" onClick={() => setOpen(false)}>
          <X className="h-5 w-5 text-white" />
        </Button>
      </div>
      <nav className="no-scrollbar flex-1 space-y-1 overflow-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white",
                active && "bg-primary text-white"
              )}
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Button className="w-full justify-start text-white hover:bg-white/10" variant="ghost" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen md:flex">
      <div className="hidden md:fixed md:inset-y-0 md:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-50 md:hidden">{sidebar}</div>}
      <div className="min-h-screen flex-1 md:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button aria-label="Open menu" className="md:hidden" size="icon" variant="secondary" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Finance Management</p>
              <h1 className="text-lg font-bold md:text-xl">{current?.label ?? "Dashboard"}</h1>
            </div>
          </div>
          <div className="hidden rounded-md border border-border px-3 py-2 text-sm font-semibold text-slate-600 sm:block">
            admin@finance.com
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
