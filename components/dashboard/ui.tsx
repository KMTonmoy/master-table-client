"use client";

import { useId, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ChevronDown, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerTier, OrderStatus, ProductStatus } from "@/types/dashboard.types";

/* -------------------------------------------------------------------------- */
/*  Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <section
    className={cn(
      "relative min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl",
      className,
    )}
  >
    {children}
  </section>
);

export const CardHeader = ({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
    <div className="min-w-0">
      <h3 className="font-heading text-lg font-semibold leading-tight text-foreground">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <h1 className="font-heading text-3xl font-bold leading-tight text-foreground md:text-4xl">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Controls                                                                   */
/* -------------------------------------------------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: LucideIcon;
};

export const Button = ({ variant = "outline", size = "md", icon: Icon, className, children, ...props }: ButtonProps) => (
  <button
    type="button"
    {...props}
    className={cn(
      "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50",
      size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
      variant === "primary" &&
        "bg-primary text-[#2B1B10] shadow-[0_6px_18px_-6px_rgba(224,165,38,0.7)] hover:brightness-105 active:scale-[0.98]",
      variant === "outline" && "border border-border bg-card/60 text-foreground hover:border-primary/40 hover:bg-card",
      variant === "ghost" && "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      variant === "danger" && "border border-destructive/30 text-destructive hover:bg-destructive/10",
      className,
    )}
  >
    {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
    {children}
  </button>
);

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <label className={cn("relative block", className)}>
    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-full border border-border bg-card/60 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25"
    />
  </label>
);

export const Select = ({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className={cn("relative", className)}>
    <select
      {...props}
      className="h-10 w-full appearance-none rounded-full border border-border bg-card/60 pl-4 pr-9 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25 [&>option]:bg-background"
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);

export const Segmented = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
}) => {
  const id = useId();
  return (
    <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card/60 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              active ? "text-[#2B1B10]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            )}
            <span className="relative">{o.label}</span>
            {o.count !== undefined && (
              <span className={cn("relative text-[10px] tabular-nums", active ? "opacity-70" : "opacity-60")}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      checked ? "border-primary bg-primary" : "border-border bg-foreground/10",
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all",
        checked ? "left-[1.375rem]" : "left-0.5",
      )}
    />
  </button>
);

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

export const inputClass =
  "h-10 w-full rounded-xl border border-border bg-background/40 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25";

/* -------------------------------------------------------------------------- */
/*  Badges & small pieces                                                      */
/* -------------------------------------------------------------------------- */

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

const toneClass: Record<Tone, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-600 dark:text-red-400",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  neutral: "bg-foreground/8 text-muted-foreground",
  gold: "bg-primary/20 text-[#8a5d00] dark:text-primary",
};

export const Badge = ({ tone = "neutral", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) => (
  <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", toneClass[tone])}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const orderTone = (s: OrderStatus): Tone =>
  ({ Pending: "warning", Preparing: "gold", "Out for delivery": "info", Delivered: "success", Cancelled: "danger" } as const)[s];

export const productTone = (s: ProductStatus): Tone =>
  ({ Active: "success", "Low stock": "warning", "Out of stock": "danger", Draft: "neutral" } as const)[s];

export const tierTone = (t: CustomerTier): Tone =>
  ({ Regular: "neutral", Silver: "info", Gold: "gold", VIP: "success" } as const)[t];

export const Avatar = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/20 font-semibold text-[#8a5d00] ring-1 ring-inset ring-primary/30 dark:text-primary",
        size === "sm" && "h-8 w-8 text-[11px]",
        size === "md" && "h-10 w-10 text-xs",
        size === "lg" && "h-14 w-14 text-base",
      )}
    >
      {initials}
    </span>
  );
};

export const Delta = ({ value, trend }: { value: string; trend: "up" | "down" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
      trend === "up" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400",
    )}
  >
    {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {value}
  </span>
);

export const ProgressBar = ({ value, className, color = "var(--primary)" }: { value: number; className?: string; color?: string }) => (
  <div className={cn("h-2 w-full overflow-hidden rounded-full bg-foreground/10", className)}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

export const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="flex flex-col items-center justify-center gap-1 px-6 py-14 text-center">
    <p className="font-heading text-lg font-semibold text-foreground">{title}</p>
    <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Tables                                                                     */
/* -------------------------------------------------------------------------- */

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
  </div>
);

export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th className={cn("whitespace-nowrap border-b border-border/80 px-5 py-3 text-left text-xs font-medium text-muted-foreground first:pl-6 last:pr-6", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn("border-b border-border/50 px-5 py-3.5 align-middle text-foreground first:pl-6 last:pr-6", className)}>{children}</td>
);

/* -------------------------------------------------------------------------- */
/*  Stat card                                                                  */
/* -------------------------------------------------------------------------- */

export const StatCard = ({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  series,
  note,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  series?: number[];
  note?: string;
}) => (
  <Card className="p-5 sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      {delta && trend && <Delta value={delta} trend={trend} />}
    </div>
    <div className="mt-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate font-heading text-3xl font-bold leading-none text-foreground">{value}</p>
        {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
      </div>
      {series && <Sparkline data={series} trend={trend ?? "up"} className="h-10 w-24 shrink-0" />}
    </div>
  </Card>
);

/* -------------------------------------------------------------------------- */
/*  Charts (pure SVG / HTML, no chart library needed)                          */
/* -------------------------------------------------------------------------- */

type Pt = [number, number];

const smoothPath = (pts: Pt[]) =>
  pts.reduce((d, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = a[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");

const toPoints = (data: number[], max: number): Pt[] =>
  data.map((v, i) => [(i / Math.max(1, data.length - 1)) * 100, 100 - (v / max) * 100]);

export const Sparkline = ({ data, trend = "up", className }: { data: number[]; trend?: "up" | "down"; className?: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts: Pt[] = data.map((v, i) => [(i / (data.length - 1)) * 100, 90 - ((v - min) / range) * 80]);
  const color = trend === "up" ? "#10b981" : "#ef4444";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const AreaChart = ({
  data,
  labels,
  compare,
  height = 280,
  formatValue = (n) => n.toLocaleString(),
  formatAxis,
  labelEvery = 1,
}: {
  data: number[];
  labels: string[];
  compare?: number[];
  height?: number;
  formatValue?: (n: number) => string;
  /** Short format for the y-axis. Defaults to 1.2k style numbers. */
  formatAxis?: (n: number) => string;
  labelEvery?: number;
}) => {
  const axis = formatAxis ?? ((n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : `${n}`));
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data, ...(compare ?? [0])) * 1.12;
  const pts = toPoints(data, max);
  const line = smoothPath(pts);
  const area = `${line} L100,100 L0,100 Z`;
  const comparePath = compare ? smoothPath(toPoints(compare, max)) : null;
  const hp = hover !== null ? pts[hover] : null;
  const pct = hp ? hp[0] : 0;

  return (
    <div className="relative w-full pl-11">
      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        {[0, 25, 50, 75, 100].map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-border/70" style={{ top: `${t}%` }}>
            <span className="absolute right-full top-0 mr-3 -translate-y-1/2 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
              {axis(Math.round(max * (1 - t / 100)))}
            </span>
          </div>
        ))}

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {comparePath && (
            <path d={comparePath} fill="none" stroke="var(--muted-foreground)" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          )}
          <motion.path key={`a-${data.join(",")}`} d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
          <motion.path
            key={`l-${data.join(",")}`}
            d={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          {hp && <line x1={hp[0]} x2={hp[0]} y1={0} y2={100} stroke="var(--primary)" strokeOpacity={0.4} strokeWidth={1} vectorEffect="non-scaling-stroke" />}
        </svg>

        {hp && (
          <>
            <span
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow"
              style={{ left: `${hp[0]}%`, top: `${hp[1]}%` }}
            />
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-xl"
              style={{
                left: `${pct}%`,
                top: `${Math.max(hp[1] - 6, 0)}%`,
                transform: `translate(${pct < 12 ? "0%" : pct > 88 ? "-100%" : "-50%"}, -100%)`,
              }}
            >
              <p className="text-muted-foreground">{labels[hover as number]}</p>
              <p className="font-heading text-sm font-semibold text-foreground">{formatValue(data[hover as number])}</p>
              {compare && <p className="text-muted-foreground">Before: {formatValue(compare[hover as number])}</p>}
            </div>
          </>
        )}

        <div className="absolute inset-0 flex">
          {data.map((_, i) => (
            <div key={i} className="h-full flex-1" onMouseEnter={() => setHover(i)} />
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
        {labels.map((l, i) => (
          <span key={i} className={cn("flex-1 text-center", i % labelEvery !== 0 && "invisible")}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

export const BarChart = ({
  data,
  labels,
  height = 220,
  formatValue = (n) => n.toLocaleString(),
}: {
  data: number[];
  labels: string[];
  height?: number;
  formatValue?: (n: number) => string;
}) => {
  const max = Math.max(...data);
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 pt-8 sm:gap-3" style={{ height: height + 32 }}>
        {data.map((v, i) => {
          const isMax = v === max;
          return (
            <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className="absolute inset-x-0 top-0 text-center text-[11px] font-medium tabular-nums text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {formatValue(v)}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(v / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "w-full rounded-t-xl transition-colors",
                  isMax ? "bg-primary" : "bg-primary/35 group-hover:bg-primary/70",
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {labels.map((l) => (
          <span key={l} className="flex-1 text-center text-[11px] text-muted-foreground">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

export const Donut = ({
  segments,
  size = 190,
  thickness = 16,
  children,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  children?: ReactNode;
}) => {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 50 - thickness / 2;
  const C = 2 * Math.PI * r;
  const gap = 1.2;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--foreground)" strokeOpacity={0.08} strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = Math.max(0, (s.value / total) * C - gap);
          const el = (
            <motion.circle
              key={s.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            />
          );
          offset += (s.value / total) * C;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};

export const Legend = ({ items }: { items: { label: string; value: string; color: string }[] }) => (
  <ul className="w-full space-y-2.5">
    {items.map((it) => (
      <li key={it.label} className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2.5 text-foreground">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: it.color }} />
          <span className="truncate">{it.label}</span>
        </span>
        <span className="font-medium tabular-nums text-muted-foreground">{it.value}</span>
      </li>
    ))}
  </ul>
);
