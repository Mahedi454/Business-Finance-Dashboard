"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function WithdrawsPage() {
  return <ModulePage config={modules.withdraws} />;
}
