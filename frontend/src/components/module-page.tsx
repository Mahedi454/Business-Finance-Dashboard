"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table, Td, Th } from "@/components/ui/table";
import { api } from "@/lib/api";
import { FieldConfig, getPathValue, labelMap, ModuleConfig } from "@/lib/modules";
import { formatDate, formatMoney } from "@/lib/utils";

type ApiList = {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; pages: number };
};

const dateInputValue = (value: unknown) => {
  if (!value) return "";
  return new Date(String(value)).toISOString().slice(0, 10);
};

function displayValue(row: Record<string, unknown>, column: ModuleConfig["columns"][number]) {
  const value = getPathValue(row, column.key);
  if (column.kind === "money") return formatMoney(value as string | number);
  if (column.kind === "date") return formatDate(value as string);
  if (column.kind === "progress") {
    const progress = Math.round(Number(value ?? 0));
    const status = getPathValue(row, "paymentSummary.paymentStatus");
    return (
      <div className="min-w-32">
        <div className="mb-1 flex justify-between text-xs font-semibold">
          <span>{status as string}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }
  return labelMap[String(value)] ?? String(value ?? "-");
}

function fieldValue(row: Record<string, unknown>, field: FieldConfig) {
  const value = row[field.name];
  if (field.type === "date") return dateInputValue(value);
  return value ?? "";
}

export function ModulePage({ config }: { config: ModuleConfig }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientOptions, setClientOptions] = useState<FieldConfig["options"]>([]);
  const [projectOptions, setProjectOptions] = useState<FieldConfig["options"]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<FieldConfig["options"]>([]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues,
  });

  const fields = useMemo(
    () =>
      config.fields.map((field) => {
        if (field.name === "clientId") return { ...field, options: clientOptions };
        if (field.name === "projectId") return { ...field, options: projectOptions };
        if (field.name === "employeeId") return { ...field, options: employeeOptions };
        return field;
      }),
    [config.fields, clientOptions, projectOptions, employeeOptions]
  );

  async function loadRows() {
    setLoading(true);
    setError("");
    try {
      const result = await api<ApiList>(`${config.apiPath}?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      setRows(result.data);
      setMeta(result.meta);
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    const needsClients = config.fields.some((field) => field.name === "clientId");
    const needsProjects = config.fields.some((field) => field.name === "projectId");
    const needsEmployees = config.fields.some((field) => field.name === "employeeId");

    const [clients, projects, employees] = await Promise.all([
      needsClients ? api<ApiList>("/api/clients?limit=100") : Promise.resolve(null),
      needsProjects ? api<ApiList>("/api/projects?limit=100") : Promise.resolve(null),
      needsEmployees ? api<ApiList>("/api/employees?limit=100") : Promise.resolve(null),
    ]);
    setClientOptions(clients?.data.map((item) => ({ value: Number(item.id), label: String(item.clientName) })) ?? []);
    setProjectOptions(projects?.data.map((item) => ({ value: Number(item.id), label: String(item.projectName) })) ?? []);
    setEmployeeOptions(employees?.data.map((item) => ({ value: Number(item.id), label: String(item.employeeName) })) ?? []);
  }

  useEffect(() => {
    loadRows().catch((err) => setError(err instanceof Error ? err.message : "Failed to load records"));
  }, [page, search]);

  useEffect(() => {
    loadOptions().catch(() => undefined);
  }, [config.apiPath]);

  function openCreate() {
    setEditing(null);
    form.reset(config.defaultValues);
    setOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    form.reset(Object.fromEntries(config.fields.map((field) => [field.name, fieldValue(row, field)])));
    setOpen(true);
  }

  async function save(values: Record<string, unknown>) {
    const id = editing?.id;
    await api(id ? `${config.apiPath}/${id}` : config.apiPath, {
      method: id ? "PUT" : "POST",
      json: values,
    });
    setOpen(false);
    await loadRows();
  }

  async function remove(row: Record<string, unknown>) {
    const confirmed = window.confirm(`Delete this ${config.singular.toLowerCase()}?`);
    if (!confirmed) return;
    await api(`${config.apiPath}/${row.id}`, { method: "DELETE" });
    await loadRows();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Manage</p>
          <h2 className="text-2xl font-extrabold">{config.title}</h2>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add {config.singular}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{config.title} List</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search records" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p>}
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  {config.columns.map((column) => <Th key={column.key}>{column.label}</Th>)}
                  <Th className="w-24 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><Td colSpan={config.columns.length + 1}>Loading...</Td></tr>
                ) : rows.length ? (
                  rows.map((row) => (
                    <tr key={String(row.id)}>
                      {config.columns.map((column) => <Td key={column.key}>{displayValue(row, column)}</Td>)}
                      <Td>
                        <div className="flex justify-end gap-2">
                          <Button aria-label="Edit record" size="icon" variant="secondary" onClick={() => openEdit(row)}><Edit className="h-4 w-4" /></Button>
                          <Button aria-label="Delete record" size="icon" variant="danger" onClick={() => remove(row)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr><Td colSpan={config.columns.length + 1}>No records found.</Td></tr>
                )}
              </tbody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{meta.total} records</span>
            <div className="flex gap-2">
              <Button disabled={page <= 1} variant="secondary" onClick={() => setPage((value) => value - 1)}>Previous</Button>
              <Button disabled={page >= meta.pages} variant="secondary" onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} title={`${editing ? "Edit" : "Add"} ${config.singular}`} onClose={() => setOpen(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(save)}>
          {fields.map((field) => (
            <div className={field.type === "textarea" ? "sm:col-span-2" : ""} key={field.name}>
              <label className="mb-2 block text-sm font-semibold">{field.label}</label>
              <Controller
                control={form.control}
                name={field.name}
                render={({ field: controller }) => {
                  if (field.type === "select") {
                    return (
                      <Select {...controller} value={String(controller.value ?? "")}>
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </Select>
                    );
                  }
                  if (field.type === "textarea") return <Textarea {...controller} value={String(controller.value ?? "")} />;
                  return <Input {...controller} step={field.type === "number" ? "0.01" : undefined} type={field.type} value={String(controller.value ?? "")} />;
                }}
              />
              {form.formState.errors[field.name]?.message && (
                <p className="mt-1 text-xs text-danger">{String(form.formState.errors[field.name]?.message)}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
