"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function SalariesPage() {
  return <ModulePage config={modules.salaries} />;
}
