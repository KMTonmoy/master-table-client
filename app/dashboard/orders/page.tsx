"use client";

import { useMemo, useState } from "react";
import { Bike, Check, CreditCard, Download, Printer, Store, Utensils, X } from "lucide-react";
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
import { money, orders } from "@/lib/dashboard-data";
import type { Order, OrderStatus } from "@/types/dashboard.types";

type Filter = "All" | OrderStatus;

const CHANNEL_ICON = { "Dine-in": Utensils, Delivery: Bike, Pickup: Store } as const;

const OrderDetail = ({ order }: { order: Order }) => {
  const cancelled = order.status === "Cancelled";
  const flow: OrderStatus[] =
    order.channel === "Delivery"
      ? ["Pending", "Preparing", "Out for delivery", "Delivered"]
      : ["Pending", "Preparing", "Delivered"];
  const current = flow.indexOf(order.status);
  const counts = order.items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i]: (acc[i] ?? 0) + 1 }), {});
  const subtotal = +(order.total / 1.05).toFixed(2);
  const service = +(order.total - subtotal).toFixed(2);

  return (
    <Card className="xl:sticky xl:top-24">
      <CardHeader
        title={order.id}
        subtitle={`${order.channel}${order.table ? ` · ${order.table}` : ""} · ${order.time}`}
        action={<Badge tone={orderTone(order.status)}>{order.status}</Badge>}
      />

      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={order.customer} />
          <div>
            <p className="font-medium text-foreground">{order.customer}</p>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" /> Pays by {order.payment.toLowerCase()}
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
                    <span className={cn("absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px", i < current ? "bg-primary" : "bg-border")} />
                  )}
                  <span
                    className={cn(
                      "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      done ? "border-primary bg-primary text-[#2B1B10]" : "border-border bg-background text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={cn("text-sm leading-6", done ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <X className="h-4 w-4 shrink-0" /> This order was cancelled and the payment was refunded.
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Items</p>
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-background/40">
            {Object.entries(counts).map(([name, qty]) => (
              <li key={name} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-foreground">{name}</span>
                <span className="text-muted-foreground">× {qty}</span>
              </li>
            ))}
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
          <Button variant="primary" className="flex-1" disabled={cancelled || order.status === "Delivered"}>
            Move to next step
          </Button>
          <Button icon={Printer} aria-label="Print receipt" />
        </div>
      </div>
    </Card>
  );
};

const Orders = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(orders[0].id);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    orders.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, []);

  const filtered = orders.filter(
    (o) =>
      (filter === "All" || o.status === filter) &&
      `${o.id} ${o.customer}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  return (
    <>
      <PageHeader
        title="Orders"
        description="Follow every order from the kitchen to the table or the doorstep."
        actions={
          <>
            <Button icon={Download}>Export</Button>
            <Button variant="primary">New order</Button>
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={(["All", "Pending", "Preparing", "Out for delivery", "Delivered", "Cancelled"] as Filter[]).map((f) => ({
                value: f,
                label: f,
                count: counts[f] ?? 0,
              }))}
            />
            <SearchInput value={query} onChange={setQuery} placeholder="Search order or guest" className="w-full sm:w-64" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No orders here" hint="There are no orders with this status right now. New orders show up as soon as they are placed." />
          ) : (
            <div className="border-t border-border/70">
              <Table>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const Icon = CHANNEL_ICON[o.channel];
                    const active = o.id === selected.id;
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedId(o.id)}
                        className={cn("cursor-pointer transition-colors", active ? "bg-primary/10" : "hover:bg-foreground/[0.03]")}
                      >
                        <Td>
                          <button
                            type="button"
                            onClick={() => setSelectedId(o.id)}
                            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                          >
                            <p className="font-medium">{o.id}</p>
                            <p className="text-xs text-muted-foreground">{o.time}</p>
                          </button>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar name={o.customer} size="sm" />
                            <span>{o.customer}</span>
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
                        <Td className="text-right font-medium tabular-nums">{money(o.total)}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card>

        <OrderDetail order={selected} />
      </div>
    </>
  );
};

export default Orders;
