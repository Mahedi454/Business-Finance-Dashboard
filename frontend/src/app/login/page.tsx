"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setError("");
    try {
      await api("/api/auth/login", { method: "POST", json: values });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  useEffect(() => {
    setSessionExpired(new URLSearchParams(window.location.search).get("session") === "expired");
  }, []);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#F6F8FC] p-4">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-[#082F6D] via-[#006DAA] to-[#11A853]" />
      <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
      <Card className="animate-login-card relative w-full max-w-md overflow-hidden border-white/70 shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-[#082F6D] via-[#008DCE] to-[#27C85A]" />
        <CardContent className="p-7">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 animate-logo-float items-center justify-center rounded-xl bg-white shadow-lg ring-1 ring-border">
              <Image alt="Business Finance Dashboard" className="h-11 w-11 object-contain" height={44} src="/logo.png" width={44} />
            </div>
            <h1 className="text-2xl font-extrabold">Business Finance Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to access the finance dashboard.</p>
          </div>
          {sessionExpired && (
            <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              Your session expired. Please log in again.
            </p>
          )}
          <form autoComplete="off" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <Input autoComplete="off" placeholder="admin@finance.com" type="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="mt-1 text-xs text-danger">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Password</label>
              <div className="relative">
                <Input autoComplete="new-password" placeholder="Enter password" type={showPassword ? "text" : "password"} {...form.register("password")} />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p className="mt-1 text-xs text-danger">{form.formState.errors.password.message}</p>}
            </div>
            {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}
            <Button className="w-full shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
