"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bike,
  Check,
  ChefHat,
  ChevronDown,
  Clock,
  Loader2,
  Package,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Store,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type FilterTab = "All" | OrderStatus;

const FILTERS: FilterTab[] = [
  "All",
  "Pending",
  "Preparing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLES: Record<
  OrderStatus,
  {
    chip: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Pending: {
    chip: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    icon: Clock,
  },
  Preparing: {
    chip: "bg-primary/15 text-primary border-primary/30",
    dot: "bg-primary",
    icon: ChefHat,
  },
  "Out for delivery": {
    chip: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dot: "bg-sky-500",
    icon: Bike,
  },
  Delivered: {
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: Check,
  },
  Cancelled: {
    chip: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    icon: XCircle,
  },
};

const CHANNEL_ICON: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Delivery: Bike,
  Pickup: Store,
  "Dine-in": Utensils,
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

const countBy = (orders: Order[], status: FilterTab) =>
  status === "All"
    ? orders.length
    : orders.filter((o) => o.status === status).length;

const Orders = () => {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<Order[]>(
          `${API_URL}/orders/my-orders`,
          { withCredentials: true },
        );
        if (cancelled) return;
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message = extractError(err, "Failed to load your orders");
        if (
          axios.isAxiosError(err) &&
          (err.response?.status === 401 || err.response?.status === 403)
        ) {
          router.replace("/");
          return;
        }
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filtered = useMemo(
    () =>
      filter === "All" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter],
  );

  const totals = useMemo(() => {
    const active = orders.filter(
      (o) =>
        o.status === "Pending" ||
        o.status === "Preparing" ||
        o.status === "Out for delivery",
    ).length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const lifetime = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { active, delivered, lifetime };
  }, [orders]);

  const canCancel = (order: Order) =>
    order.status === "Pending" || order.status === "Preparing";

  const handleCancel = async (order: Order) => {
    if (!canCancel(order)) return;
    if (!window.confirm(`Cancel order ${order.id}?`)) return;

    setBusyId(order.id);
    setCancelError(null);
    try {
      await axios.patch(
        `${API_URL}/orders/${encodeURIComponent(order.id)}/cancel`,
        {},
        { withCredentials: true },
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "Cancelled" as OrderStatus } : o,
        ),
      );
    } catch (err) {
      setCancelError(extractError(err, "Failed to cancel order"));
    } finally {
      setBusyId(null);
    }
  };

  const handleReorder = (order: Order) => {
    const params = new URLSearchParams();
    order.items.forEach((item) => params.append("add", item));
    router.push(`/menu?${params.toString()}`);
  };

  const totalSpentFormatted = money(totals.lifetime, 0);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Package className="h-3.5 w-3.5" />
            My orders
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Your order history
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Follow live orders from the kitchen to your door, or reorder a
            favourite in one tap.
          </p>
        </div>

        <Link
          href="/menu"
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <ShoppingBag className="h-4 w-4" />
          Browse menu
        </Link>
      </motion.header>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Active
              </p>
              <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
                {totals.active}
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Delivered
              </p>
              <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
                {totals.delivered}
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl"
          />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Lifetime spend
              </p>
              <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
                {totalSpentFormatted}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 p-3 sm:gap-1.5 sm:p-4">
          {FILTERS.map((tab) => {
            const active = filter === tab;
            const count = countBy(orders, tab);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors sm:px-4",
                  active
                    ? "text-[#2B1B10]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="orders-filter-pill"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 520, damping: 38 }
                    }
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {tab}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-[#2B1B10]/15 text-[#2B1B10]"
                        : "bg-foreground/10 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {cancelError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-destructive/30"
            >
              <div className="flex items-center gap-2 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {cancelError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <div>
              <p className="font-heading text-xl font-semibold text-foreground">
                {orders.length === 0
                  ? "No orders yet"
                  : `No ${filter.toLowerCase()} orders`}
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {orders.length === 0
                  ? "Browse the menu and place your first order — it'll appear here instantly."
                  : "Try a different filter to see more orders."}
              </p>
            </div>
            {orders.length === 0 && (
              <Link
                href="/menu"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <ArrowRight className="h-4 w-4" />
                Explore the menu
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {filtered.map((order, i) => {
              const style = STATUS_STYLES[order.status];
              const StatusIcon = style.icon;
              const ChannelIcon = CHANNEL_ICON[order.channel] ?? Package;
              const expanded = expandedId === order.id;
              const itemCount = order.items?.length ?? 0;
              const busy = busyId === order.id;

              return (
                <motion.li
                  key={order.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="group"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    aria-expanded={expanded}
                    className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02] sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                          style.chip,
                        )}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-heading text-base font-semibold text-foreground">
                            {order.id}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              style.chip,
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                style.dot,
                              )}
                            />
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {order.time}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ChannelIcon className="h-3 w-3" />
                            {order.channel}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {itemCount} item{itemCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-heading text-lg font-bold tabular-nums text-foreground">
                          {money(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.payment}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                          expanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden border-t border-border/60 bg-foreground/[0.02]"
                      >
                        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                          <div>
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                              Items
                            </h4>
                            <ul className="space-y-2">
                              {order.items?.map((item, idx) => (
                                <li
                                  key={`${item}-${idx}`}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm"
                                >
                                  <span className="truncate text-foreground">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                              Details
                            </h4>
                            <dl className="space-y-2.5 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">
                                  Channel
                                </dt>
                                <dd className="font-medium text-foreground">
                                  {order.channel}
                                </dd>
                              </div>
                              {order.table && (
                                <div className="flex items-center justify-between gap-3">
                                  <dt className="text-muted-foreground">
                                    Table
                                  </dt>
                                  <dd className="font-medium text-foreground">
                                    {order.table}
                                  </dd>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">
                                  Payment
                                </dt>
                                <dd className="font-medium text-foreground">
                                  {order.payment}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">Time</dt>
                                <dd className="font-medium text-foreground">
                                  {order.time}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2.5">
                                <dt className="font-medium text-foreground">
                                  Total
                                </dt>
                                <dd className="font-heading text-lg font-bold tabular-nums text-primary">
                                  {money(order.total)}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-5 py-4 sm:px-6">
                          {canCancel(order) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(order)}
                              disabled={busy}
                              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-destructive/40 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {busy ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Cancelling…
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  Cancel order
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Reorder
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
};

export default Orders;
