"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trend } from "@/types/dashboard.types";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: Trend;
  icon: React.ComponentType<{ className?: string }>;
  note?: string;
};

export default function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  note,
}: StatCardProps) {
  const positive = trend === "up";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
            {value}
          </p>
          {delta && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                  positive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/15 text-red-600 dark:text-red-400",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {delta}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
          {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
