"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function ExpensesPage() {
  return <ModulePage config={modules.expenses} />;
}
