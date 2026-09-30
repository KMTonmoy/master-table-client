"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Crown,
  Download,
  Mail,
  MapPin,
  Plus,
  Repeat,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Donut,
  EmptyState,
  Field,
  Legend,
  PageHeader,
  SearchInput,
  Segmented,
  StatCard,
  Table,
  Td,
  Th,
  inputClass,
  tierTone,
} from "@/components/dashboard/ui";
import { money } from "@/lib/format";
import type { Customer, CustomerTier } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type Filter = "All" | CustomerTier;

const TIER_COLORS: Record<CustomerTier, string> = {
  VIP: "var(--chart-1)",
  Gold: "var(--chart-2)",
  Silver: "var(--chart-3)",
  Regular: "var(--chart-4)",
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

const Customers = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", city: "" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/customers`, {
          withCredentials: true,
        });
        if (cancelled) return;
        setCustomers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(extractError(err, "Failed to load customers"));
        setCustomers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/customers`, {
        withCredentials: true,
      });
      setCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(extractError(err, "Failed to refresh customers"));
    }
  };

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          (filter === "All" || c.tier === filter) &&
          `${c.name} ${c.email} ${c.city}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [customers, filter, query],
  );

  const tiers = (["VIP", "Gold", "Silver", "Regular"] as CustomerTier[]).map(
    (t) => ({
      label: t,
      value: customers.filter((c) => c.tier === t).length,
      color: TIER_COLORS[t],
    }),
  );

  const top = [...customers].sort((a, b) => b.spent - a.spent).slice(0, 4);
  const totalSpent = customers.reduce((a, c) => a + c.spent, 0);
  const avgSpend = customers.length ? totalSpent / customers.length : 0;
  const returning = customers.length
    ? Math.round(
        (customers.filter((c) => c.orders > 1).length / customers.length) * 100,
      )
    : 0;

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      await axios.post(
        `${API_URL}/api/customers`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
        },
        { withCredentials: true },
      );
      setForm({ name: "", email: "", city: "" });
      setAdding(false);
      await reload();
    } catch (err) {
      setError(extractError(err, "Failed to create customer"));
    }
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description="Know who dines with you, how often they come back and who deserves a thank-you."
        actions={
          <>
            <Button icon={Download}>Export</Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setAdding((v) => !v)}
            >
              Add customer
            </Button>
          </>
        }
      />

      {error && (
        <Card className="border-destructive/40 p-5 text-sm text-destructive">
          Could not reach the API: {error}
        </Card>
      )}

      {adding && (
        <Card className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Full name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                autoFocus
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              disabled={!form.name.trim() || !form.email.trim()}
              onClick={submit}
            >
              Save customer
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total customers"
          value={customers.length.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="New this month"
          value={customers.filter((c) => c.orders <= 2).length.toLocaleString()}
          icon={UserPlus}
        />
        <StatCard
          label="Returning rate"
          value={`${returning}%`}
          icon={Repeat}
        />
        <StatCard label="Average spend" value={money(avgSpend)} icon={Crown} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={(
                ["All", "VIP", "Gold", "Silver", "Regular"] as Filter[]
              ).map((f) => ({ value: f, label: f }))}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search name, email or city"
              className="w-full sm:w-72"
            />
          </div>

          {loading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-xl bg-foreground/5"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No customers found"
              hint="Try another tier or a different search term."
            />
          ) : (
            <div className="border-t border-border/70">
              <Table>
                <thead>
                  <tr>
                    <Th>Customer</Th>
                    <Th>City</Th>
                    <Th>Orders</Th>
                    <Th>Total spent</Th>
                    <Th>Tier</Th>
                    <Th>Last visit</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-foreground/[0.03]"
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} />
                          <div className="min-w-0">
                            <p className="font-medium">{c.name}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" /> {c.email}
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {c.city}
                        </span>
                      </Td>
                      <Td className="tabular-nums">{c.orders}</Td>
                      <Td className="font-medium tabular-nums">
                        {money(c.spent)}
                      </Td>
                      <Td>
                        <Badge tone={tierTone(c.tier)}>{c.tier}</Badge>
                      </Td>
                      <Td className="text-muted-foreground">{c.lastVisit}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>

        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader
              title="Loyalty tiers"
              subtitle="How your guests are split"
            />
            <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-6 xl:flex-col 2xl:flex-row">
              <Donut segments={tiers} size={160} thickness={16}>
                <p className="font-heading text-2xl font-bold text-foreground">
                  {customers.length}
                </p>
                <p className="text-xs text-muted-foreground">shown here</p>
              </Donut>
              <Legend
                items={tiers.map((t) => ({
                  label: t.label,
                  value: String(t.value),
                  color: t.color,
                }))}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Top spenders"
              subtitle="Your best guests this year"
            />
            <ul className="divide-y divide-border/60 px-5 pb-2 pt-3 sm:px-6">
              {top.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-sm font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.orders} orders
                    </p>
                  </div>
                  <span className="font-heading text-sm font-semibold tabular-nums text-primary">
                    {money(c.spent, 0)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Customers;
