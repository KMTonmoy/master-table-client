"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  CalendarClock,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
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
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

type Format = "PDF" | "XLSX" | "CSV";

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

const FORMATS: Format[] = ["PDF", "XLSX", "CSV"];

const extractError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      fallback
    );
  }
  return err instanceof Error ? err.message : fallback;
};

const slug = (s: string) =>
  (s || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const today = () => new Date().toISOString().slice(0, 10);

const extFor = (format: string) => {
  const f = (format || "CSV").toUpperCase();
  if (f === "XLSX") return "xlsx";
  if (f === "PDF") return "pdf";
  return "csv";
};

const parseFilename = (disposition: string) => {
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1].replace(/"/g, ""));
  } catch {
    return match[1].replace(/"/g, "");
  }
};

const Reports = () => {
  const [weekly, setWeekly] = useState(true);
  const [monthly, setMonthly] = useState(true);
  const [daily, setDaily] = useState(false);
  const [defaultFormat, setDefaultFormat] = useState<Format>("PDF");

  const [generating, setGenerating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<Report[]>(`${API_URL}/api/reports`, {
          withCredentials: true,
        });
        if (cancelled) return;
        setReports(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(extractError(err, "Failed to load reports"));
        setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  const reload = async () => {
    try {
      const { data } = await axios.get<Report[]>(`${API_URL}/api/reports`, {
        withCredentials: true,
      });
      setReports(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(extractError(err, "Failed to refresh reports"));
    }
  };

  const generate = async (name: string, format: Format = defaultFormat) => {
    if (generating) return;
    setGenerating(`${name}:${format}`);
    setError(null);
    try {
      await axios.post(
        `${API_URL}/api/reports/generate`,
        { name, format },
        { withCredentials: true },
      );
      await reload();
    } catch (err) {
      setError(extractError(err, "Failed to generate report"));
    } finally {
      setGenerating(null);
    }
  };

  const download = async (report: Report) => {
    if (downloading) return;
    setDownloading(report.id);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/reports/${encodeURIComponent(report.id)}/download`,
        { withCredentials: true, responseType: "blob" },
      );

      const contentType = String(
        response.headers["content-type"] || "application/octet-stream",
      );
      const blob = new Blob([response.data], { type: contentType });

      const disposition = String(response.headers["content-disposition"] || "");
      const filename =
        parseFilename(disposition) ||
        `${slug(report.name)}-${today()}.${extFor(report.format)}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(extractError(err, "Failed to download report"));
    } finally {
      setDownloading(null);
    }
  };

  const removeOne = async (report: Report) => {
    if (deleting) return;
    if (!window.confirm(`Delete "${report.name}"? This cannot be undone.`)) {
      return;
    }
    setDeleting(report.id);
    setError(null);

    const snapshot = reports;
    setReports((prev) => prev.filter((r) => r.id !== report.id));

    try {
      await axios.delete(
        `${API_URL}/api/reports/${encodeURIComponent(report.id)}`,
        { withCredentials: true },
      );
    } catch (err) {
      setReports(snapshot);
      setError(extractError(err, "Failed to delete report"));
    } finally {
      setDeleting(null);
    }
  };

  const clearAll = async () => {
    if (clearingAll) return;
    if (reports.length === 0) return;
    if (
      !window.confirm(
        `Delete all ${reports.length} reports? This cannot be undone.`,
      )
    ) {
      return;
    }
    setClearingAll(true);
    setError(null);

    const snapshot = reports;
    setReports([]);

    try {
      await axios.delete(`${API_URL}/api/reports`, {
        withCredentials: true,
      });
    } catch (err) {
      setReports(snapshot);
      setError(extractError(err, "Failed to clear reports"));
    } finally {
      setClearingAll(false);
    }
  };

  const isGenerating = (name: string) =>
    generating !== null && generating.startsWith(`${name}:`);

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
            {generating === "Custom report:PDF" ||
            generating === "Custom report:XLSX" ||
            generating === "Custom report:CSV"
              ? "Generating…"
              : "Custom report"}
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
          const busy = isGenerating(t.name);
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

              <div className="mt-5 space-y-3">
                <FormatPicker
                  value={defaultFormat}
                  disabled={generating !== null}
                  onChange={setDefaultFormat}
                />
                <Button
                  className="w-full"
                  size="sm"
                  icon={busy ? Loader2 : RefreshCw}
                  onClick={() => generate(t.name, defaultFormat)}
                  disabled={busy || (generating !== null && !busy)}
                >
                  {busy ? "Generating…" : `Generate ${defaultFormat}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardHeader
              title="Recent reports"
              subtitle="Download or clean up anything you generated"
            />
            {reports.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                icon={clearingAll ? Loader2 : Trash2}
                className="mt-4 mr-4 sm:mt-5 sm:mr-5"
                onClick={clearAll}
                disabled={clearingAll}
              >
                {clearingAll ? "Clearing…" : "Clear all"}
              </Button>
            )}
          </div>

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
                    <Th className="w-48" />
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const busy = downloading === r.id;
                    const removing = deleting === r.id;
                    return (
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
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              icon={busy ? Loader2 : Download}
                              onClick={() => download(r)}
                              disabled={downloading !== null || removing}
                            >
                              {busy ? "Downloading…" : "Download"}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              icon={removing ? Loader2 : Trash2}
                              onClick={() => removeOne(r)}
                              disabled={removing || downloading !== null}
                              aria-label={`Delete ${r.name}`}
                            >
                              {removing ? "" : ""}
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
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
                <Toggle checked={s.v} onChange={s.set} label={s.label} />
              </div>
            ))}

            <div className="border-t border-border/60 pt-5">
              <Field label="Default file format">
                <Select
                  value={defaultFormat}
                  onChange={(e) => setDefaultFormat(e.target.value as Format)}
                >
                  <option value="PDF">PDF</option>
                  <option value="XLSX">XLSX</option>
                  <option value="CSV">CSV</option>
                </Select>
              </Field>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

const FormatPicker = ({
  value,
  onChange,
  disabled,
}: {
  value: Format;
  onChange: (v: Format) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex h-9 w-full items-center justify-between rounded-2xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                onChange(f);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                f === value ? "text-primary" : "text-foreground"
              }`}
            >
              {f}
              {f === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
