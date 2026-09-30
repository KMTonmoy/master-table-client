"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bike,
  Check,
  CreditCard,
  Download,
  Printer,
  Store,
  Utensils,
  X,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  SearchInput,
  Segmented,
  Table,
  Td,
  Th,
  orderTone,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type Filter = "All" | OrderStatus;

const CHANNEL_ICON = {
  "Dine-in": Utensils,
  Delivery: Bike,
  Pickup: Store,
} as const;

const FLOW_BY_CHANNEL: Record<Order["channel"], OrderStatus[]> = {
  Delivery: ["Pending", "Preparing", "Out for delivery", "Delivered"],
  "Dine-in": ["Pending", "Preparing", "Delivered"],
  Pickup: ["Pending", "Preparing", "Delivered"],
};

const ALL_STATUSES: OrderStatus[] = [
  "Pending",
  "Preparing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

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

const OrderDetail = ({
  order,
  onAdvance,
  onClose,
}: {
  order: Order;
  onAdvance: (order: Order) => void;
  onClose: () => void;
}) => {
  const cancelled = order.status === "Cancelled";
  const flow = FLOW_BY_CHANNEL[order.channel] ?? FLOW_BY_CHANNEL["Dine-in"];
  const current = flow.indexOf(order.status);
  const counts = order.items.reduce<Record<string, number>>(
    (acc, i) => ({ ...acc, [i]: (acc[i] ?? 0) + 1 }),
    {},
  );
  const subtotal = +(order.total / 1.05).toFixed(2);
  const service = +(order.total - subtotal).toFixed(2);

  return (
    <Card>
      <CardHeader
        title={order.id}
        subtitle={`${order.channel}${order.table ? ` · ${order.table}` : ""} · ${order.time}`}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={orderTone(order.status)}>{order.status}</Badge>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={order.customer} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {order.customer}
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              Pays by {order.payment.toLowerCase()}
            </p>
          </div>
        </div>

        {!cancelled ? (
          <ol>
            {flow.map((s, i) => {
              const done = i <= current;
              return (
                <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < flow.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px",
                        i < current ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      done
                        ? "border-primary bg-primary text-[#2B1B10]"
                        : "border-border bg-background text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-6",
                      done
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {s}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <X className="h-4 w-4 shrink-0" />
            This order was cancelled and the payment was refunded.
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Items</p>
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-background/40">
            {Object.entries(counts).length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                No items
              </li>
            ) : (
              Object.entries(counts).map(([name, qty]) => (
                <li
                  key={name}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="truncate text-foreground">{name}</span>
                  <span className="text-muted-foreground">× {qty}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Service charge (5%)</dt>
            <dd className="tabular-nums">{money(service)}</dd>
          </div>
          <div className="flex justify-between border-t border-border/70 pt-3 font-heading text-lg font-semibold text-foreground">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(order.total)}</dd>
          </div>
        </dl>

        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            disabled={cancelled || order.status === "Delivered"}
            onClick={() => onAdvance(order)}
          >
            {order.status === "Delivered"
              ? "Order complete"
              : cancelled
                ? "Cancelled"
                : "Move to next step"}
          </Button>
          <Button icon={Printer} aria-label="Print receipt" />
        </div>
      </div>
    </Card>
  );
};

const Orders = () => {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get<Order[]>(`${API_URL}/api/orders`, {
        params: { status: filter !== "All" ? filter : undefined },
        withCredentials: true,
      });
      const safe = Array.isArray(data) ? data : [];
      setOrders(safe);
      setError(null);
    } catch (err) {
      setError(extractError(err, "Failed to load orders"));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "All" && o.status !== filter) return false;
      if (!q) return true;
      return `${o.id} ${o.customer}`.toLowerCase().includes(q);
    });
  }, [orders, filter, query]);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  const advance = async (order: Order) => {
    const flow = FLOW_BY_CHANNEL[order.channel] ?? FLOW_BY_CHANNEL["Dine-in"];
    const next = flow[flow.indexOf(order.status) + 1];
    if (!next) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)),
    );

    try {
      await axios.patch(
        `${API_URL}/api/orders/${order.id}`,
        { status: next },
        { withCredentials: true },
      );
    } catch {
      await load();
    }
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Follow every order from the kitchen to the table or the doorstep."
        actions={<Button icon={Download}>Export</Button>}
      />

      {error && (
        <Card className="border-destructive/40 p-5 text-sm text-destructive">
          Could not reach the API: {error}
        </Card>
      )}

      <Card className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={(["All", ...ALL_STATUSES] as Filter[]).map((f) => ({
              value: f,
              label: f,
              count: counts[f] ?? 0,
            }))}
          />
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search order or guest"
            className="w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-foreground/5"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No orders here"
            hint="There are no orders with this status right now. New orders show up as soon as they are placed."
          />
        ) : (
          <div className="border-t border-border/70">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Time</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const Icon = CHANNEL_ICON[o.channel] ?? Utensils;
                  const active = selected && o.id === selected.id;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedId(o.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        active ? "bg-primary/10" : "hover:bg-foreground/[0.03]",
                      )}
                    >
                      <Td className="font-medium">{o.id}</Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={o.customer} size="sm" />
                          <span className="truncate">{o.customer}</span>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          {o.channel}
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={orderTone(o.status)}>{o.status}</Badge>
                      </Td>
                      <Td className="text-muted-foreground">{o.time}</Td>
                      <Td className="text-right font-medium tabular-nums">
                        {money(o.total)}
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(o.id);
                          }}
                          aria-label={`View ${o.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
          <span>
            Showing {filtered.length} of {orders.length} orders
          </span>
        </div>
      </Card>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              key="drawer"
              initial={reduce ? { x: 0, opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-background shadow-2xl sm:max-w-lg"
            >
              <OrderDetail
                order={selected}
                onAdvance={advance}
                onClose={() => setSelectedId(null)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Orders;
