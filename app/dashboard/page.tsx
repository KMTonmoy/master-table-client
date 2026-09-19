"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Download, Package, Plus, ShoppingBag, Star, Users } from "lucide-react";
import {
  AreaChart,
  Badge,
  Button,
  Card,
  CardHeader,
  Delta,
  Donut,
  Legend,
  PageHeader,
  ProgressBar,
  Segmented,
  StatCard,
  Table,
  Td,
  Th,
  orderTone,
} from "@/components/dashboard/ui";
import {
  MONTHS,
  WEEKDAYS,
  activity,
  categories,
  days30,
  money,
  orders,
  products,
  reservations,
  revenue12m,
  revenue12mPrev,
  revenue30d,
  revenue7d,
  topDishes,
} from "@/lib/dashboard-data";

type Range = "7d" | "30d" | "12m";

const RANGES = {
  "7d": { data: revenue7d, compare: [820, 870, 930, 960, 1290, 1510, 1090], labels: WEEKDAYS, title: "This week", delta: "+9.6%", every: 1 },
  "30d": { data: revenue30d, compare: revenue30d.map((v) => Math.round(v * 0.9)), labels: days30, title: "Last 30 days", delta: "+11.2%", every: 3 },
  "12m": { data: revenue12m, compare: revenue12mPrev, labels: MONTHS, title: "This year", delta: "+12.4%", every: 1 },
} as const;

const toneDot: Record<string, string> = {
  gold: "bg-primary",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

const Dashboard = () => {
  const [range, setRange] = useState<Range>("12m");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  const r = RANGES[range];
  const total = r.data.reduce((a, b) => a + b, 0);
  const lowStock = products.filter((p) => p.status === "Low stock" || p.status === "Out of stock");

  return (
    <>
      <PageHeader
        title="Welcome back, Admin"
        description={today ? `${today}. Here is how Master Table is doing.` : "Here is how Master Table is doing."}
        actions={
          <>
            <Button icon={Download}>Export</Button>
            <Link href="/dashboard/orders">
              <Button variant="primary" icon={Plus}>
                New order
              </Button>
            </Link>
          </>
        }
      />

      {/* Hero: revenue, edge to edge */}
      <Card className="rounded-[2rem]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-6 px-5 pt-6 sm:px-8 sm:pt-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Revenue · {r.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="font-heading text-5xl font-bold leading-none text-foreground sm:text-6xl">{money(total, 0)}</p>
              <Delta value={r.delta} trend="up" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">The dashed line shows the previous period for comparison.</p>
          </div>
          <Segmented<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "12m", label: "12 months" },
            ]}
          />
        </div>
        <div className="relative px-5 pb-6 pt-8 sm:px-8 sm:pb-8">
          <AreaChart
            data={[...r.data]}
            compare={[...r.compare]}
            labels={[...r.labels]}
            height={300}
            labelEvery={r.every}
            formatValue={(n) => money(n, 0)}
            formatAxis={(n) => (n >= 1000 ? `$${+(n / 1000).toFixed(1)}k` : `$${n}`)}
          />
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value="$24,780" delta="+12.4%" trend="up" icon={DollarSign} series={revenue12m} note="Vs $22,050 last month" />
        <StatCard label="Orders" value="1,284" delta="+8.1%" trend="up" icon={ShoppingBag} series={[90, 96, 88, 104, 112, 108, 121, 130]} note="43 orders per day" />
        <StatCard label="Customers" value="3,472" delta="+4.9%" trend="up" icon={Users} series={[30, 34, 33, 38, 41, 40, 46, 49]} note="182 new this month" />
        <StatCard label="Products" value="100" delta="-2.3%" trend="down" icon={Package} series={[110, 108, 107, 105, 104, 102, 101, 100]} note={`${lowStock.length} need restocking`} />
      </div>

      {/* Orders + top dishes */}
      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="Recent orders"
            subtitle="The latest activity across dine-in, pickup and delivery"
            action={
              <Link href="/dashboard/orders">
                <Button size="sm">View all orders</Button>
              </Link>
            }
          />
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-foreground/[0.03]">
                    <Td>
                      <p className="font-medium">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.time}</p>
                    </Td>
                    <Td>{o.customer}</Td>
                    <Td className="text-muted-foreground">{o.table ? `${o.channel} · ${o.table}` : o.channel}</Td>
                    <Td>
                      <Badge tone={orderTone(o.status)}>{o.status}</Badge>
                    </Td>
                    <Td className="text-right font-medium tabular-nums">{money(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Most ordered dishes" subtitle="Portions sold this month" />
          <ul className="space-y-5 p-5 sm:p-6">
            {topDishes.map((d) => (
              <li key={d.name}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2.5 font-medium text-foreground">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-lg">{d.emoji}</span>
                    {d.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{d.sold.toLocaleString()}</span>
                </div>
                <ProgressBar value={d.share} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <Card>
          <CardHeader title="Sales by category" subtitle="Share of revenue this month" />
          <div className="flex flex-col items-center gap-6 p-5 sm:p-6 md:flex-row">
            <Donut
              segments={categories.map((c, i) => ({
                label: c.name,
                value: c.share,
                color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "#b98a4a", "#7a6a5a"][i],
              }))}
            >
              <p className="font-heading text-2xl font-bold text-foreground">$24.8k</p>
              <p className="text-xs text-muted-foreground">this month</p>
            </Donut>
            <Legend
              items={categories.map((c, i) => ({
                label: c.name,
                value: `${c.share}%`,
                color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "#b98a4a", "#7a6a5a"][i],
              }))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Live activity" subtitle="What is happening right now" />
          <ul className="space-y-4 p-5 sm:p-6">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneDot[a.tone]}`} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2 2xl:col-span-1">
          <CardHeader
            title="Tonight's reservations"
            subtitle="4 bookings, 22 guests"
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-foreground">
                <Star className="h-3 w-3 text-primary" /> 4.9 rating
              </span>
            }
          />
          <ul className="divide-y divide-border/60 px-5 pb-2 pt-3 sm:px-6">
            {reservations.map((r) => (
              <li key={r.time} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-4">
                  <span className="w-16 font-heading text-base font-semibold text-primary">{r.time}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.guests} guests</p>
                  </div>
                </div>
                <Badge tone="neutral" dot={false}>
                  {r.table}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
