"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function EmployeesPage() {
  return <ModulePage config={modules.employees} />;
}
