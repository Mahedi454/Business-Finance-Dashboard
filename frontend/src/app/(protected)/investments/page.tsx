"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function InvestmentsPage() {
  return <ModulePage config={modules.investments} />;
}
