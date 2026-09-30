"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarClock,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
  Toggle,
} from "@/components/dashboard/ui";
import type { Report } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const TEMPLATES = [
  {
    name: "Sales summary",
    desc: "Revenue, orders and average bill",
    icon: FileText,
  },
  {
    name: "Inventory",
    desc: "Stock levels and wastage",
    icon: FileSpreadsheet,
  },
  {
    name: "Menu performance",
    desc: "Best and slowest dishes",
    icon: FileText,
  },
  {
    name: "Customer growth",
    desc: "New, returning and lapsed guests",
    icon: FileText,
  },
];

const extractError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

const Reports = () => {
  const [weekly, setWeekly] = useState(true);
  const [monthly, setMonthly] = useState(true);
  const [daily, setDaily] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get<Report[]>(`${API_URL}/api/reports`);
      setReports(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(extractError(err, "Failed to load reports"));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async (name: string) => {
    if (generating) return;
    setGenerating(name);
    try {
      await axios.post(`${API_URL}/api/reports/generate`, { name });
      await load();
    } catch (err) {
      setError(extractError(err, "Failed to generate report"));
    } finally {
      setGenerating(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Create a report in one click, or let Master Table email it to you on a schedule."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => generate("Custom report")}
            disabled={generating !== null}
          >
            {generating === "Custom report" ? "Generating…" : "Custom report"}
          </Button>
        }
      />

      {error && (
        <Card className="border-destructive/40 p-5 text-sm text-destructive">
          Could not reach the API: {error}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const busy = generating === t.name;
          return (
            <Card key={t.name} className="flex flex-col p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                {t.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {t.desc}
              </p>
              <Button
                className="mt-5"
                size="sm"
                icon={RefreshCw}
                onClick={() => generate(t.name)}
                disabled={busy || (generating !== null && !busy)}
              >
                {busy ? "Generating…" : "Generate now"}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="Recent reports"
            subtitle="Download anything you generated in the last 30 days"
          />
          <div className="mt-4">
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-xl bg-foreground/5"
                  />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <EmptyState
                title="No reports yet"
                hint="Click a template above or generate a custom report — it will show up here."
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Report</Th>
                    <Th>Period</Th>
                    <Th>Format</Th>
                    <Th>Size</Th>
                    <Th>Updated</Th>
                    <Th className="w-28" />
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-foreground/[0.03]"
                    >
                      <Td>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.desc}
                        </p>
                      </Td>
                      <Td className="text-muted-foreground">{r.range}</Td>
                      <Td>
                        <Badge tone="gold" dot={false}>
                          {r.format}
                        </Badge>
                      </Td>
                      <Td className="tabular-nums text-muted-foreground">
                        {r.size}
                      </Td>
                      <Td className="text-muted-foreground">{r.updated}</Td>
                      <Td>
                        <Button size="sm" icon={Download}>
                          Download
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader
            title="Email schedule"
            subtitle="Reports are sent to admin@mastertable.com"
          />
          <div className="space-y-5 p-5 sm:p-6">
            {[
              {
                label: "Daily closing report",
                hint: "Every night at 11:00 PM",
                v: daily,
                set: setDaily,
              },
              {
                label: "Weekly sales summary",
                hint: "Every Monday at 8:00 AM",
                v: weekly,
                set: setWeekly,
              },
              {
                label: "Monthly performance",
                hint: "On the 1st of each month",
                v: monthly,
                set: setMonthly,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {s.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.hint}</p>
                  </div>
                </div>
                <Toggle
                  checked={s.v}
                  onChange={s.set}
                  label={s.label}
                />
              </div>
            ))}

            <div className="border-t border-border/60 pt-5">
              <Field label="Default file format">
                <Select defaultValue="PDF">
                  <option>PDF</option>
                  <option>XLSX</option>
                  <option>CSV</option>
                </Select>
              </Field>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Reports;