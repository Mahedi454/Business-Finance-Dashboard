"use client";

import { ModulePage } from "@/components/module-page";
import { modules } from "@/lib/modules";

export default function ProjectsPage() {
  return <ModulePage config={modules.projects} />;
}
