"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Clock, Eye, MousePointerClick, Receipt } from "lucide-react";
import {
  AreaChart,
  BarChart,
  Card,
  CardHeader,
  Donut,
  Legend,
  PageHeader,
  ProgressBar,
  Segmented,
  StatCard,
} from "@/components/dashboard/ui";
import { WEEKDAYS, money } from "@/lib/format";
import type { RevenueSeries } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

type Range = "30d" | "12m";

type TrafficSegment = { name: string; value: number; color: string };
type FunnelStep = { label: string; value: number };
type Heatmap = { hours: number[]; grid: number[][] };

const Analytics = () => {
  const [range, setRange] = useState<Range>("12m");
  const isYear = range === "12m";

  const [revenue, setRevenue] = useState<RevenueSeries | null>(null);
  const [weekdayOrders, setWeekdayOrders] = useState<number[]>([]);
  const [heatmap, setHeatmap] = useState<Heatmap | null>(null);
  const [traffic, setTraffic] = useState<TrafficSegment[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadRevenue = useCallback(async (r: Range) => {
    try {
      const { data } = await axios.get<RevenueSeries>(
        `${API_URL}/api/dashboard/revenue`,
        {
          params: { range: r },
          withCredentials: true,
        },
      );
      setRevenue(data);
      setError(null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ||
          err.response?.data?.message ||
          err.message
        : "Failed to load revenue";
      setError(message);
      setRevenue(null);
    }
  }, []);

  const loadStatic = useCallback(async () => {
    try {
      const [wd, hm, tr, fn] = await Promise.all([
        axios.get<number[]>(`${API_URL}/api/analytics/weekday-orders`, {
          withCredentials: true,
        }),
        axios.get<Heatmap>(`${API_URL}/api/analytics/heatmap`, {
          withCredentials: true,
        }),
        axios.get<TrafficSegment[]>(`${API_URL}/api/analytics/traffic`, {
          withCredentials: true,
        }),
        axios.get<FunnelStep[]>(`${API_URL}/api/analytics/funnel`, {
          withCredentials: true,
        }),
      ]);
      setWeekdayOrders(Array.isArray(wd.data) ? wd.data : []);
      setHeatmap(hm.data ?? null);
      setTraffic(Array.isArray(tr.data) ? tr.data : []);
      setFunnel(Array.isArray(fn.data) ? fn.data : []);
      setError(null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ||
          err.response?.data?.message ||
          err.message
        : "Failed to load analytics";
      setError(message);
    }
  }, []);

  useEffect(() => {
    void loadRevenue(range);
  }, [range, loadRevenue]);

  useEffect(() => {
    void loadStatic();
  }, [loadStatic]);

  const heatMax = heatmap ? Math.max(1, ...heatmap.grid.flat()) : 1;
  const totalTraffic = funnel[0]?.value ?? 0;

  const totalOrdersFromWeekday = weekdayOrders.reduce((a, b) => a + b, 0);
  const averageBill =
    revenue && totalOrdersFromWeekday > 0
      ? revenue.total / totalOrdersFromWeekday
      : 0;

  const conversionRate = funnel.length
    ? Math.round(
        ((funnel[funnel.length - 1]?.value ?? 0) / (totalTraffic || 1)) * 100,
      )
    : 0;

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

      {error && (
        <Card className="border-destructive/40 p-5 text-sm text-destructive">
          Could not reach the API: {error}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Site visits"
          value={totalTraffic.toLocaleString()}
          icon={Eye}
          series={[12, 13, 12.5, 14, 15, 15.8, 17, 18.4]}
        />
        <StatCard
          label="Conversion rate"
          value={funnel.length ? `${conversionRate}%` : "—"}
          icon={MousePointerClick}
          series={[10.2, 10.9, 11.4, 11.8, 12.3, 12.6, 13.1, 13.5]}
        />
        <StatCard
          label="Average bill"
          value={averageBill > 0 ? money(averageBill) : "—"}
          icon={Receipt}
          series={[29, 28.6, 28.9, 28.1, 27.8, 27.6, 27.5, 27.4]}
        />
        <StatCard
          label="Prep time"
          value="14 min"
          icon={Clock}
          series={[17, 16.5, 16, 15.4, 15, 14.6, 14.2, 14]}
          note="Lower is better"
        />
      </div>

      <Card className="rounded-[2rem]">
        <CardHeader
          title="Revenue over time"
          subtitle={
            isYear
              ? "Monthly revenue against the year before"
              : "Daily revenue against the previous 30 days"
          }
          className="sm:px-8 sm:pt-8"
        />
        <div className="px-5 pb-6 pt-8 sm:px-8 sm:pb-8">
          {revenue ? (
            <AreaChart
              data={revenue.data}
              compare={revenue.compare}
              labels={revenue.labels}
              height={320}
              labelEvery={isYear ? 1 : 3}
              formatValue={(n) => money(n, 0)}
              formatAxis={(n) =>
                n >= 1000 ? `$${+(n / 1000).toFixed(1)}k` : `$${n}`
              }
            />
          ) : (
            <div className="h-[320px] w-full animate-pulse rounded-2xl bg-foreground/5" />
          )}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader
            title="Orders by weekday"
            subtitle="Which day brings the most orders"
          />
          <div className="p-5 sm:p-6">
            {weekdayOrders.length ? (
              <BarChart data={weekdayOrders} labels={WEEKDAYS} height={230} />
            ) : (
              <div className="h-[230px] w-full animate-pulse rounded-2xl bg-foreground/5" />
            )}
          </div>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader
            title="Busiest hours"
            subtitle="Orders per hour over the last 90 days, darker means busier"
          />
          <div className="overflow-x-auto p-5 sm:p-6">
            {heatmap ? (
              <div className="min-w-[520px]">
                <div
                  className="ml-12 grid gap-1.5 pb-2 text-center text-[11px] text-muted-foreground"
                  style={{
                    gridTemplateColumns: `repeat(${heatmap.hours.length}, minmax(0, 1fr))`,
                  }}
                >
                  {heatmap.hours.map((h) => (
                    <span key={h}>{h}:00</span>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {heatmap.grid.map((row, r) => (
                    <div key={r} className="flex items-center gap-2">
                      <span className="w-10 text-xs text-muted-foreground">
                        {WEEKDAYS[r]}
                      </span>
                      <div
                        className="grid flex-1 gap-1.5"
                        style={{
                          gridTemplateColumns: `repeat(${heatmap.hours.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {row.map((v, c) => (
                          <div
                            key={c}
                            title={`${WEEKDAYS[r]} ${heatmap.hours[c]}:00 · ${v} orders`}
                            className="h-9 rounded-lg border border-border/40 transition-transform hover:scale-110"
                            style={{
                              background: `color-mix(in oklab, var(--primary) ${Math.round(
                                (v / heatMax) * 100,
                              )}%, transparent)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 w-full animate-pulse rounded-2xl bg-foreground/5" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Where guests come from"
            subtitle="Share of site visits by source"
          />
          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-6">
            {traffic.length ? (
              <>
                <Donut
                  segments={traffic.map((t) => ({
                    label: t.name,
                    value: t.value,
                    color: t.color,
                  }))}
                  size={180}
                >
                  <p className="font-heading text-2xl font-bold text-foreground">
                    {totalTraffic
                      ? `${(totalTraffic / 1000).toFixed(1)}k`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">visits</p>
                </Donut>
                <Legend
                  items={traffic.map((t) => ({
                    label: t.name,
                    value: `${t.value}%`,
                    color: t.color,
                  }))}
                />
              </>
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-full bg-foreground/5" />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="From menu to table"
            subtitle="How many visitors finish an order"
          />
          <ul className="space-y-5 p-5 sm:p-6">
            {funnel.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Funnel data will appear once your site has traffic.
              </li>
            ) : (
              funnel.map((f, i) => {
                const pct = (f.value / (funnel[0]?.value || 1)) * 100;
                const drop =
                  i > 0
                    ? Math.round(
                        (1 - f.value / (funnel[i - 1].value || 1)) * 100,
                      )
                    : null;
                return (
                  <li key={f.label}>
                    <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">
                        {f.label}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {f.value.toLocaleString()}
                        {drop !== null && (
                          <span className="ml-2 text-xs text-red-500">
                            −{drop}%
                          </span>
                        )}
                      </span>
                    </div>
                    <ProgressBar value={pct} className="h-3" />
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default Analytics;
