"use client";

import { useState } from "react";
import { Clock, Eye, MousePointerClick, Receipt } from "lucide-react";
import {
  AreaChart,
  BarChart,
  Button,
  Card,
  CardHeader,
  Donut,
  Legend,
  PageHeader,
  ProgressBar,
  Segmented,
  StatCard,
} from "@/components/dashboard/ui";
import {
  HOURS,
  MONTHS,
  WEEKDAYS,
  days30,
  funnel,
  heatmap,
  money,
  ordersByWeekday,
  revenue12m,
  revenue12mPrev,
  revenue30d,
  trafficSources,
} from "@/lib/dashboard-data";

type Range = "30d" | "12m";

const HEAT_MAX = Math.max(...heatmap.flat());

const Analytics = () => {
  const [range, setRange] = useState<Range>("12m");
  const isYear = range === "12m";
  const data = isYear ? revenue12m : revenue30d;
  const compare = isYear ? revenue12mPrev : revenue30d.map((v) => Math.round(v * 0.88));
  const labels = isYear ? MONTHS : days30;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="See when guests come, what they order and where they find you."
        actions={
          <Segmented<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "30d", label: "30 days" },
              { value: "12m", label: "12 months" },
            ]}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Site visits" value="18,420" delta="+14.2%" trend="up" icon={Eye} series={[12, 13, 12.5, 14, 15, 15.8, 17, 18.4]} />
        <StatCard label="Conversion rate" value="13.5%" delta="+1.4%" trend="up" icon={MousePointerClick} series={[10.2, 10.9, 11.4, 11.8, 12.3, 12.6, 13.1, 13.5]} />
        <StatCard label="Average bill" value="$27.40" delta="-0.8%" trend="down" icon={Receipt} series={[29, 28.6, 28.9, 28.1, 27.8, 27.6, 27.5, 27.4]} />
        <StatCard label="Prep time" value="14 min" delta="-6.0%" trend="up" icon={Clock} series={[17, 16.5, 16, 15.4, 15, 14.6, 14.2, 14]} note="Lower is better" />
      </div>

      <Card className="rounded-[2rem]">
        <CardHeader
          title="Revenue over time"
          subtitle={isYear ? "Monthly revenue against the year before" : "Daily revenue against the previous 30 days"}
          className="sm:px-8 sm:pt-8"
        />
        <div className="px-5 pb-6 pt-8 sm:px-8 sm:pb-8">
          <AreaChart
            data={data}
            compare={compare}
            labels={labels}
            height={320}
            labelEvery={isYear ? 1 : 3}
            formatValue={(n) => money(n, 0)}
            formatAxis={(n) => (n >= 1000 ? `$${+(n / 1000).toFixed(1)}k` : `$${n}`)}
          />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader title="Orders by weekday" subtitle="Saturdays are your busiest day" />
          <div className="p-5 sm:p-6">
            <BarChart data={ordersByWeekday} labels={WEEKDAYS} height={230} />
          </div>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader title="Busiest hours" subtitle="Average orders per hour, darker means busier" />
          <div className="overflow-x-auto p-5 sm:p-6">
            <div className="min-w-[520px]">
              <div className="ml-12 grid grid-cols-12 gap-1.5 pb-2 text-center text-[11px] text-muted-foreground">
                {HOURS.map((h) => (
                  <span key={h}>{h}:00</span>
                ))}
              </div>
              <div className="space-y-1.5">
                {heatmap.map((row, r) => (
                  <div key={r} className="flex items-center gap-2">
                    <span className="w-10 text-xs text-muted-foreground">{WEEKDAYS[r]}</span>
                    <div className="grid flex-1 grid-cols-12 gap-1.5">
                      {row.map((v, c) => (
                        <div
                          key={c}
                          title={`${WEEKDAYS[r]} ${HOURS[c]}:00 · ${v} orders`}
                          className="h-9 rounded-lg border border-border/40 transition-transform hover:scale-110"
                          style={{ background: `color-mix(in oklab, var(--primary) ${Math.round((v / HEAT_MAX) * 100)}%, transparent)` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Where guests come from" subtitle="Share of site visits by source" />
          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-6">
            <Donut segments={trafficSources.map((t) => ({ label: t.name, value: t.value, color: t.color }))} size={180}>
              <p className="font-heading text-2xl font-bold text-foreground">18.4k</p>
              <p className="text-xs text-muted-foreground">visits</p>
            </Donut>
            <Legend items={trafficSources.map((t) => ({ label: t.name, value: `${t.value}%`, color: t.color }))} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="From menu to table"
            subtitle="How many visitors finish an order"
            action={<Button size="sm">Details</Button>}
          />
          <ul className="space-y-5 p-5 sm:p-6">
            {funnel.map((f, i) => {
              const pct = (f.value / funnel[0].value) * 100;
              const drop = i > 0 ? Math.round((1 - f.value / funnel[i - 1].value) * 100) : null;
              return (
                <li key={f.label}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{f.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {f.value.toLocaleString()}
                      {drop !== null && <span className="ml-2 text-xs text-red-500">−{drop}%</span>}
                    </span>
                  </div>
                  <ProgressBar value={pct} className="h-3" />
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default Analytics;
