"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
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
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

const headerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

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
    chip: "bg-[#E0A526]/15 text-[#E0A526] border-[#E0A526]/30",
    dot: "bg-[#E0A526]",
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative"
        >
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-[#E0A526]"
          />
          <Loader2 className="h-8 w-8 animate-spin text-[#E0A526]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient gold glows */}
      <motion.div
        aria-hidden
        animate={
          reduce ? undefined : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-[#E0A526]/12 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={
          reduce ? undefined : { opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }
        }
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.5,
        }}
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/12 blur-[120px]"
      />

      {/* HEADER */}
      <motion.header
        variants={headerContainer}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="relative flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <motion.p
            variants={headerItem}
            className="inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E0A526]"
          >
            <Package className="h-3.5 w-3.5" />
            My orders
          </motion.p>
          <motion.h1
            variants={headerItem}
            className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
          >
            Your order{" "}
            <span className="relative inline-block text-[#E0A526]">
              history
              <motion.span
                aria-hidden
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.5 }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
              />
            </span>
          </motion.h1>
          <motion.p
            variants={headerItem}
            className="mt-3 max-w-2xl text-base text-muted-foreground"
          >
            Follow live orders from the kitchen to your door, or reorder a
            favourite in one tap.
          </motion.p>
        </div>

        <motion.div variants={headerItem}>
          <Link
            href="/menu"
            className="
              group/btn relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl
              bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-sm font-semibold text-[#3B2416]
              shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
              transition-shadow duration-300
              hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
            "
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
            <span className="relative flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Browse menu
            </span>
          </Link>
        </motion.div>
      </motion.header>

      {/* STATS */}
      <motion.div
        variants={headerContainer}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Active"
          value={String(totals.active)}
          tone="gold"
        />
        <StatCard
          icon={<Check className="h-5 w-5" />}
          label="Delivered"
          value={String(totals.delivered)}
          tone="emerald"
        />
        <StatCard
          icon={<Receipt className="h-5 w-5" />}
          label="Lifetime spend"
          value={totalSpentFormatted}
          tone="amber"
        />
      </motion.div>

      {/* ORDERS PANEL */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
      >
        {/* Top shine line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
        />

        {/* FILTER TABS */}
        <div className="relative flex flex-wrap items-center gap-2 border-b border-border/70 p-3 sm:gap-1.5 sm:p-4">
          {FILTERS.map((tab) => {
            const active = filter === tab;
            const count = countBy(orders, tab);
            return (
              <motion.button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                whileHover={!active ? { y: -2 } : undefined}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: EASE }}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors sm:px-4",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-[#3B2416]"
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
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_8px_20px_-8px_rgba(224,165,38,0.6)]"
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {tab}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-black/15 text-[#3B2416]"
                        : "bg-foreground/10 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* ERROR BANNER (cancel) */}
        <AnimatePresence>
          {cancelError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden border-b border-destructive/30"
            >
              <div className="flex items-center gap-2 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {cancelError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR BANNER (fetch) */}
        {error && (
          <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <motion.div
            initial={
              reduce ? false : { opacity: 0, y: 20, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E0A526]/15 blur-3xl"
            />
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
                delay: 0.2,
              }}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526] shadow-[0_0_30px_rgba(224,165,38,0.3)]"
            >
              <ShoppingBag className="h-7 w-7" />
            </motion.span>
            <div className="relative">
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
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
                whileHover={reduce ? undefined : { scale: 1.03 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
              >
                <Link
                  href="/menu"
                  className="
                    group/btn relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl
                    bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-sm font-semibold text-[#3B2416]
                    shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
                    transition-shadow duration-300
                    hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
                  "
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Explore the menu
                  </span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <ul className="relative divide-y divide-border/70">
            <AnimatePresence initial={false}>
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
                    layout={!reduce}
                    variants={cardReveal}
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: -10,
                            scale: 0.98,
                            filter: "blur(6px)",
                          }
                    }
                    transition={{
                      duration: reduce ? 0 : 0.6,
                      delay: reduce ? 0 : Math.min(i * 0.03, 0.3),
                      ease: EASE,
                    }}
                    className="group relative"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : order.id)}
                      aria-expanded={expanded}
                      whileHover={reduce ? undefined : { y: -2 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02] sm:px-6"
                    >
                      {/* Hover gold glow */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#E0A526]/0 blur-2xl transition-all duration-500 group-hover:bg-[#E0A526]/20"
                      />

                      <div className="relative flex min-w-0 items-center gap-4">
                        <motion.span
                          whileHover={
                            reduce ? undefined : { rotate: -6, scale: 1.08 }
                          }
                          transition={{ duration: 0.35, ease: EASE }}
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                            style.chip,
                          )}
                        >
                          <StatusIcon className="h-5 w-5" />
                        </motion.span>
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

                      <div className="relative flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-heading text-lg font-bold tabular-nums text-[#E0A526]">
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
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="overflow-hidden border-t border-border/60 bg-foreground/[0.02]"
                        >
                          <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                            <div>
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#E0A526]">
                                Items
                              </h4>
                              <ul className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <motion.li
                                    key={`${item}-${idx}`}
                                    initial={
                                      reduce ? false : { opacity: 0, x: -8 }
                                    }
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      ease: EASE,
                                      delay: reduce ? 0 : idx * 0.04,
                                    }}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm transition-colors duration-300 hover:border-[#E0A526]/40"
                                  >
                                    <span className="truncate text-foreground">
                                      {item}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#E0A526]">
                                Details
                              </h4>
                              <dl className="space-y-2.5 text-sm">
                                <DetailRow
                                  label="Channel"
                                  value={order.channel}
                                />
                                {order.table && (
                                  <DetailRow
                                    label="Table"
                                    value={String(order.table)}
                                  />
                                )}
                                <DetailRow
                                  label="Payment"
                                  value={order.payment}
                                />
                                <DetailRow label="Time" value={order.time} />
                                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2.5">
                                  <dt className="font-medium text-foreground">
                                    Total
                                  </dt>
                                  <dd className="font-heading text-lg font-bold tabular-nums text-[#E0A526]">
                                    {money(order.total)}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-5 py-4 sm:px-6">
                            {canCancel(order) && (
                              <motion.button
                                type="button"
                                onClick={() => handleCancel(order)}
                                disabled={busy}
                                whileHover={
                                  reduce ? undefined : { scale: 1.03 }
                                }
                                whileTap={reduce ? undefined : { scale: 0.97 }}
                                transition={{ duration: 0.25, ease: EASE }}
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
                              </motion.button>
                            )}
                            <motion.button
                              type="button"
                              onClick={() => handleReorder(order)}
                              whileHover={reduce ? undefined : { scale: 1.03 }}
                              whileTap={reduce ? undefined : { scale: 0.97 }}
                              transition={{ duration: 0.25, ease: EASE }}
                              className="
                                group/btn relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-2xl
                                bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-4 text-sm font-semibold text-[#3B2416]
                                shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
                                transition-shadow duration-300
                                hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
                              "
                            >
                              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                              <span className="relative flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Reorder
                              </span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const StatCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "gold" | "emerald" | "amber";
}) => {
  const tones = {
    gold: {
      bg: "bg-[#E0A526]/15",
      text: "text-[#E0A526]",
      glow: "bg-[#E0A526]/20",
    },
    emerald: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-500",
      glow: "bg-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-500/15",
      text: "text-amber-500",
      glow: "bg-amber-500/20",
    },
  } as const;

  const t = tones[tone];

  return (
    <motion.div
      variants={cardReveal}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
      className="
        group relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl
        transition-colors duration-500
        hover:border-[#E0A526]/40
      "
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-all duration-700 group-hover:scale-125",
          t.glow,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/40 to-transparent"
      />
      <div className="relative flex items-center gap-3">
        <motion.span
          whileHover={{ rotate: -6, scale: 1.08 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            t.bg,
            t.text,
          )}
        >
          {icon}
        </motion.span>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, ease: EASE }}
    className="flex items-center justify-between gap-3"
  >
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-medium text-foreground">{value}</dd>
  </motion.div>
);

export default Orders;
