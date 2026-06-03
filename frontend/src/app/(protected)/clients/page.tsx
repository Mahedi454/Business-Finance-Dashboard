"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function ClientsPage() {
  return <ModulePage config={modules.clients} />;
}
