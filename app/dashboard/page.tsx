"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  ChefHat,
  DollarSign,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import Sparkline from "@/components/dashboard/Sparkline";
import type {
  ActivityItem,
  ActivityTone,
  DashboardRange,
  DashboardSummary,
  RevenueSeries,
  TopDish,
} from "@/types/dashboard.types";
import StatCard from "@/components/dashboard/StatCard";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

const SHELL = "mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10";

const RANGE_LABEL: Record<DashboardRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12m": "Last 12 months",
};

const PILL_LABEL: Record<DashboardRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "12m": "12 months",
};

const TONE_DOT: Record<ActivityTone, string> = {
  gold: "bg-primary shadow-[0_0_12px_var(--primary)]",
  warning: "bg-amber-500 shadow-[0_0_12px_theme(colors.amber.500)]",
  success: "bg-emerald-500 shadow-[0_0_12px_theme(colors.emerald.500)]",
  danger: "bg-red-500 shadow-[0_0_12px_theme(colors.red.500)]",
};

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

const AnimatedNumber = ({
  value,
  prefix = "",
}: {
  value: number;
  prefix?: string;
}) => {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const prevRef = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return;

    const start = prevRef.current;
    const delta = value - start;
    if (delta === 0) return;

    const duration = 700;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + delta * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  const shown = reduce ? value : display;

  return (
    <span className="tabular-nums">
      {prefix}
      {Math.round(shown).toLocaleString()}
    </span>
  );
};

const DashboardPage = () => {
  const reduce = useReducedMotion();
  const [range, setRange] = useState<DashboardRange>("12m");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSeries | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [s, a, t] = await Promise.all([
          axios.get<DashboardSummary>(`${API_URL}/api/dashboard/summary`, {
            withCredentials: true,
          }),
          axios.get<ActivityItem[]>(`${API_URL}/api/dashboard/activity`, {
            withCredentials: true,
          }),
          axios.get<TopDish[]>(`${API_URL}/api/analytics/top-dishes`, {
            withCredentials: true,
          }),
        ]);
        if (cancelled) return;
        setSummary(s.data);
        setActivity(Array.isArray(a.data) ? a.data : []);
        setTopDishes(Array.isArray(t.data) ? t.data : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(extractError(err, "Failed to reach the API"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const r = await axios.get<RevenueSeries>(
          `${API_URL}/api/dashboard/revenue`,
          { params: { range }, withCredentials: true },
        );
        if (!cancelled) setRevenue(r.data);
      } catch {
        if (!cancelled) setRevenue(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const rangeLabel = useMemo(() => RANGE_LABEL[range], [range]);

  const revenueValue = summary ? Math.round(summary.revenue.value) : 0;
  const ordersValue = summary?.orders.value ?? 0;
  const customersValue = summary?.customers.value ?? 0;
  const productsValue = summary?.products.value ?? 0;
  const lowStock = summary?.products.lowStock ?? 0;
  const newThisMonth = summary?.customers.newThisMonth ?? 0;

  return (
    <section className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[52rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className={SHELL}>
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <ChefHat className="h-3.5 w-3.5" />
              Dashboard
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Welcome back, chef
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Live numbers from your kitchen. Refresh any time — the data comes
              straight from your API.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-border bg-card/60 p-1 backdrop-blur-xl">
            {(["7d", "30d", "12m"] as DashboardRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "relative inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
                  range === r
                    ? "text-[#3B2416]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {range === r && (
                  <motion.span
                    layoutId="dash-range-pill"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 520, damping: 38 }
                    }
                    className="absolute inset-0 rounded-full bg-primary shadow-[0_0_18px_var(--primary)]"
                  />
                )}
                <span className="relative">{PILL_LABEL[r]}</span>
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-600 dark:text-red-400">
            Could not reach the API: {error}
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenue"
            value={loading ? "—" : money(revenueValue, 0)}
            delta={summary?.revenue.delta}
            trend={summary?.revenue.trend}
            icon={DollarSign}
          />
          <StatCard
            label="Orders"
            value={loading ? "—" : ordersValue.toLocaleString()}
            delta={summary?.orders.delta}
            trend={summary?.orders.trend}
            icon={ShoppingBag}
          />
          <StatCard
            label="Customers"
            value={loading ? "—" : customersValue.toLocaleString()}
            delta={summary?.customers.delta}
            trend={summary?.customers.trend}
            icon={Users}
            note={summary ? `${newThisMonth} new this month` : undefined}
          />
          <StatCard
            label="Products"
            value={loading ? "—" : productsValue.toLocaleString()}
            icon={Package}
            note={
              summary
                ? lowStock > 0
                  ? `${lowStock} need restocking`
                  : "All stocked up"
                : undefined
            }
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="relative lg:col-span-2 overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    Revenue trend
                  </h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rangeLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-3xl font-bold tabular-nums text-foreground">
                  {revenue ? (
                    <AnimatedNumber value={revenue.total} prefix="$" />
                  ) : (
                    "—"
                  )}
                </p>
                {revenue && (
                  <p
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      revenue.delta.startsWith("-")
                        ? "bg-red-500/15 text-red-500"
                        : "bg-emerald-500/15 text-emerald-500",
                    )}
                  >
                    <ArrowUpRight
                      className={cn(
                        "h-3 w-3",
                        revenue.delta.startsWith("-") && "rotate-90",
                      )}
                    />
                    {revenue.delta} vs previous period
                  </p>
                )}
              </div>
            </div>

            <div className="relative mt-6">
              {revenue && revenue.data.length > 0 ? (
                <Sparkline data={revenue.data} compare={revenue.compare} />
              ) : (
                <div className="h-64 w-full animate-pulse rounded-2xl bg-secondary/60" />
              )}
            </div>

            {revenue && (
              <div className="relative mt-3 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                {revenue.labels.map((label, i) => (
                  <span key={`${label}-${i}`} className="truncate">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="relative mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 rounded-full bg-primary" />
                Current
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 rounded-full bg-muted-foreground/60 [border-top:1px_dashed]" />
                Previous
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Live activity
                </h2>
              </div>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <ul className="mt-5 space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-10 animate-pulse rounded-xl bg-secondary/60"
                  />
                ))
              ) : activity.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  No activity yet.
                </li>
              ) : (
                activity.map((a, i) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex gap-3"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        TONE_DOT[a.tone] ?? "bg-primary",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {a.text}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </motion.li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Top dishes
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Best sellers this month
              </p>
            </div>
          </div>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-secondary/60"
                />
              ))
            ) : topDishes.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No dishes sold yet.
              </li>
            ) : (
              topDishes.map((d, i) => (
                <motion.li
                  key={d.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  whileHover={reduce ? undefined : { y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-background/50 transition-shadow hover:border-primary/40 hover:shadow-[0_8px_24px_-8px_var(--primary)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
                    {d.image ? (
                      <img
                        src={d.image}
                        alt={d.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                    <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-xs font-bold text-primary backdrop-blur">
                      #{i + 1}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-medium text-foreground">
                      {d.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{d.sold.toLocaleString()} sold</span>
                      <span className="font-semibold tabular-nums text-primary">
                        {d.share}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(4, d.share)}%` }}
                        transition={{
                          delay: 0.2 + i * 0.06,
                          duration: 0.7,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                      />
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
