"use client";

import { useState } from "react";
import { CalendarClock, Download, FileSpreadsheet, FileText, Plus, RefreshCw } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
  Toggle,
} from "@/components/dashboard/ui";
import { reports } from "@/lib/dashboard-data";

const TEMPLATES = [
  { name: "Sales summary", desc: "Revenue, orders and average bill", icon: FileText },
  { name: "Inventory", desc: "Stock levels and wastage", icon: FileSpreadsheet },
  { name: "Menu performance", desc: "Best and slowest dishes", icon: FileText },
  { name: "Customer growth", desc: "New, returning and lapsed guests", icon: FileText },
];

const Reports = () => {
  const [weekly, setWeekly] = useState(true);
  const [monthly, setMonthly] = useState(true);
  const [daily, setDaily] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const generate = (name: string) => {
    setGenerating(name);
    window.setTimeout(() => setGenerating(null), 1400);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Create a report in one click, or let Master Table email it to you on a schedule."
        actions={
          <Button variant="primary" icon={Plus}>
            Custom report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const busy = generating === t.name;
          return (
            <Card key={t.name} className="flex flex-col p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{t.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.desc}</p>
              <Button className="mt-5" size="sm" icon={RefreshCw} onClick={() => generate(t.name)} disabled={busy}>
                {busy ? "Generating…" : "Generate now"}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader title="Recent reports" subtitle="Download anything you generated in the last 30 days" />
          <div className="mt-4">
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
                  <tr key={r.id} className="transition-colors hover:bg-foreground/[0.03]">
                    <Td>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </Td>
                    <Td className="text-muted-foreground">{r.range}</Td>
                    <Td>
                      <Badge tone="gold" dot={false}>
                        {r.format}
                      </Badge>
                    </Td>
                    <Td className="tabular-nums text-muted-foreground">{r.size}</Td>
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
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Email schedule" subtitle="Reports are sent to admin@mastertable.com" />
          <div className="space-y-5 p-5 sm:p-6">
            {[
              { label: "Daily closing report", hint: "Every night at 11:00 PM", v: daily, set: setDaily },
              { label: "Weekly sales summary", hint: "Every Monday at 8:00 AM", v: weekly, set: setWeekly },
              { label: "Monthly performance", hint: "On the 1st of each month", v: monthly, set: setMonthly },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.hint}</p>
                  </div>
                </div>
                <Toggle checked={s.v} onChange={s.set} label={s.label} />
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
