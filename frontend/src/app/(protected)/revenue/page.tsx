"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function RevenuePage() {
  return <ModulePage config={modules.revenue} />;
}
