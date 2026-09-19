"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Download,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Badge,
  Button,
  Card,
  CardHeader,
  Delta,
  Donut,
  EmptyState,
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
import { money } from "@/lib/dashboard-data";
import type {
  ActivityItem,
  Category,
  DashboardSummary,
  Order,
  Reservation,
  RevenueSeries,
} from "@/types/dashboard.types";
import { api } from "@/lib/api";

type Range = "7d" | "30d" | "12m";

type TopDish = {
  name: string;
  emoji: string;
  sold: number;
  share: number;
};

const toneDot: Record<string, string> = {
  gold: "bg-primary",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

const Dashboard = () => {
  const [range, setRange] = useState<Range>("12m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSeries | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [s, r, o, c, a, rv] = await Promise.all([
          api.dashboardSummary(),
          api.dashboardRevenue(range),
          api.orders(),
          api.categories(),
          api.activity(),
          api.reservations(),
        ]);

        if (cancelled) return;

        setSummary(s);
        setRevenue(r);
        setOrders(o.slice(0, 6));
        setCategories(c);
        setActivity(a);
        setReservations(rv);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load dashboard";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const lowStock = summary?.products.lowStock ?? 0;
  const totalCategoryRevenue =
    categories.reduce((a, c) => a + c.revenue, 0) || 1;
  const categoryColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "#b98a4a",
    "#7a6a5a",
  ];

  return (
    <>
      <PageHeader
        title="Welcome back, Admin"
        description={
          today
            ? `${today}. Here is how Master Table is doing.`
            : "Here is how Master Table is doing."
        }
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

      {error && (
        <Card className="border-destructive/40 p-5 text-sm text-destructive">
          Could not reach the API: {error}
        </Card>
      )}

      <Card className="rounded-[2rem]">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6 px-5 pt-6 sm:px-8 sm:pt-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Revenue ·{" "}
              {range === "7d"
                ? "This week"
                : range === "30d"
                  ? "Last 30 days"
                  : "This year"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="font-heading text-5xl font-bold leading-none text-foreground sm:text-6xl">
                {money(revenue?.total ?? 0, 0)}
              </p>
              {revenue && (
                <Delta
                  value={revenue.delta}
                  trend={revenue.delta.startsWith("-") ? "down" : "up"}
                />
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The dashed line shows the previous period for comparison.
            </p>
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
          {revenue ? (
            <AreaChart
              data={revenue.data}
              compare={revenue.compare}
              labels={revenue.labels}
              height={300}
              labelEvery={range === "12m" ? 1 : range === "30d" ? 3 : 1}
              formatValue={(n) => money(n, 0)}
              formatAxis={(n) =>
                n >= 1000 ? `$${+(n / 1000).toFixed(1)}k` : `$${n}`
              }
            />
          ) : (
            <div className="h-[300px] w-full animate-pulse rounded-2xl bg-foreground/5" />
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={summary ? money(summary.revenue.value, 0) : "—"}
          delta={summary?.revenue.delta}
          trend={summary?.revenue.trend}
          icon={DollarSign}
          series={revenue?.data.length ? revenue.data : [1, 1, 1, 1]}
        />
        <StatCard
          label="Orders"
          value={summary ? summary.orders.value.toLocaleString() : "—"}
          delta={summary?.orders.delta}
          trend={summary?.orders.trend}
          icon={ShoppingBag}
          series={revenue?.data.length ? revenue.data : [1, 1, 1, 1]}
        />
        <StatCard
          label="Customers"
          value={summary ? summary.customers.value.toLocaleString() : "—"}
          delta={summary?.customers.delta}
          trend={summary?.customers.trend}
          icon={Users}
          note={
            summary
              ? `${summary.customers.newThisMonth} new this month`
              : undefined
          }
          series={revenue?.data.length ? revenue.data : [1, 1, 1, 1]}
        />
        <StatCard
          label="Products"
          value={summary ? summary.products.value.toLocaleString() : "—"}
          icon={Package}
          note={summary ? `${lowStock} need restocking` : undefined}
          series={revenue?.data.length ? revenue.data : [1, 1, 1, 1]}
        />
      </div>

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
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full animate-pulse rounded-xl bg-foreground/5"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                hint="Orders will show up here as soon as they come in."
              />
            ) : (
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
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="transition-colors hover:bg-foreground/[0.03]"
                    >
                      <Td>
                        <p className="font-medium">{o.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.time}
                        </p>
                      </Td>
                      <Td>{o.customer}</Td>
                      <Td className="text-muted-foreground">
                        {o.table ? `${o.channel} · ${o.table}` : o.channel}
                      </Td>
                      <Td>
                        <Badge tone={orderTone(o.status)}>{o.status}</Badge>
                      </Td>
                      <Td className="text-right font-medium tabular-nums">
                        {money(o.total)}
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
            title="Sales by category"
            subtitle="Share of revenue this month"
          />
          <div className="flex flex-col items-center gap-6 p-5 sm:p-6">
            {categories.length === 0 ? (
              <div className="h-40 w-full animate-pulse rounded-full bg-foreground/5" />
            ) : (
              <>
                <Donut
                  segments={categories.map((c, i) => ({
                    label: c.name,
                    value: c.share,
                    color: categoryColors[i % categoryColors.length],
                  }))}
                >
                  <p className="font-heading text-2xl font-bold text-foreground">
                    {money(totalCategoryRevenue, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </Donut>
                <Legend
                  items={categories.map((c, i) => ({
                    label: c.name,
                    value: `${c.share}%`,
                    color: categoryColors[i % categoryColors.length],
                  }))}
                />
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <Card>
          <CardHeader title="Top dishes" subtitle="Portions sold this month" />
          <TopDishes />
        </Card>

        <Card>
          <CardHeader
            title="Live activity"
            subtitle="What is happening right now"
          />
          <ul className="space-y-4 p-5 sm:p-6">
            {activity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                hint="Activity from your kitchen will appear here."
              />
            ) : (
              activity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneDot[a.tone]}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card className="lg:col-span-2 2xl:col-span-1">
          <CardHeader
            title="Tonight's reservations"
            subtitle={`${reservations.length} bookings, ${reservations.reduce((a, r) => a + r.guests, 0)} guests`}
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-foreground">
                <Star className="h-3 w-3 text-primary" /> 4.9 rating
              </span>
            }
          />
          <ul className="divide-y divide-border/60 px-5 pb-2 pt-3 sm:px-6">
            {reservations.length === 0 ? (
              <EmptyState
                title="No reservations tonight"
                hint="New bookings will appear here."
              />
            ) : (
              reservations.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-16 font-heading text-base font-semibold text-primary">
                      {r.time}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.guests} guests
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" dot={false}>
                    {r.table}
                  </Badge>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </>
  );
};

const TopDishes = () => {
  const [dishes, setDishes] = useState<TopDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = (await api.topDishes()) as
          | { name?: string; emoji?: string; sold?: number; share?: number }[]
          | undefined;

        if (cancelled) return;

        const safe: TopDish[] = (data || []).map((d) => ({
          name: d?.name ?? "Unknown",
          emoji: d?.emoji ?? "🍽️",
          sold: Number(d?.sold ?? 0),
          share: Number(d?.share ?? 0),
        }));
        setDishes(safe);
      } catch {
        if (!cancelled) setDishes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-5 sm:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-full animate-pulse rounded-xl bg-foreground/5"
          />
        ))}
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <EmptyState
        title="No dish data yet"
        hint="Top dishes will appear once you have sales."
      />
    );
  }

  return (
    <ul className="space-y-5 p-5 sm:p-6">
      {dishes.map((d) => (
        <li key={d.name}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2.5 font-medium text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-lg">
                {d.emoji}
              </span>
              {d.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {(d.sold ?? 0).toLocaleString()}
            </span>
          </div>
          <ProgressBar value={d.share ?? 0} />
        </li>
      ))}
    </ul>
  );
};

export default Dashboard;
