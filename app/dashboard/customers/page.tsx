"use client";

import { useMemo, useState } from "react";
import { Crown, Download, Mail, MapPin, Plus, Repeat, UserPlus, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Donut,
  EmptyState,
  Legend,
  PageHeader,
  SearchInput,
  Segmented,
  StatCard,
  Table,
  Td,
  Th,
  tierTone,
} from "@/components/dashboard/ui";
import { customers, money } from "@/lib/dashboard-data";
import type { CustomerTier } from "@/types/dashboard.types";

type Filter = "All" | CustomerTier;

const TIER_COLORS: Record<CustomerTier, string> = {
  VIP: "var(--chart-1)",
  Gold: "var(--chart-2)",
  Silver: "var(--chart-3)",
  Regular: "var(--chart-4)",
};

const Customers = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          (filter === "All" || c.tier === filter) &&
          `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [filter, query],
  );

  const tiers = (["VIP", "Gold", "Silver", "Regular"] as CustomerTier[]).map((t) => ({
    label: t,
    value: customers.filter((c) => c.tier === t).length,
    color: TIER_COLORS[t],
  }));
  const top = [...customers].sort((a, b) => b.spent - a.spent).slice(0, 4);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Know who dines with you, how often they come back and who deserves a thank-you."
        actions={
          <>
            <Button icon={Download}>Export</Button>
            <Button variant="primary" icon={Plus}>
              Add customer
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value="3,472" delta="+4.9%" trend="up" icon={Users} series={[30, 34, 33, 38, 41, 40, 46, 49]} />
        <StatCard label="New this month" value="182" delta="+12.0%" trend="up" icon={UserPlus} series={[10, 14, 12, 18, 16, 21, 19, 24]} />
        <StatCard label="Returning rate" value="64%" delta="+2.1%" trend="up" icon={Repeat} series={[58, 59, 60, 61, 61, 62, 63, 64]} />
        <StatCard label="Average spend" value="$27.40" delta="-0.8%" trend="down" icon={Crown} series={[29, 28.6, 28.9, 28.1, 27.8, 27.6, 27.5, 27.4]} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={(["All", "VIP", "Gold", "Silver", "Regular"] as Filter[]).map((f) => ({ value: f, label: f }))}
            />
            <SearchInput value={query} onChange={setQuery} placeholder="Search name, email or city" className="w-full sm:w-72" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No customers found" hint="Try another tier or a different search term." />
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
                    <tr key={c.id} className="transition-colors hover:bg-foreground/[0.03]">
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
                      <Td className="font-medium tabular-nums">{money(c.spent)}</Td>
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
            <CardHeader title="Loyalty tiers" subtitle="How your guests are split" />
            <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-6 xl:flex-col 2xl:flex-row">
              <Donut segments={tiers} size={160} thickness={16}>
                <p className="font-heading text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-xs text-muted-foreground">shown here</p>
              </Donut>
              <Legend items={tiers.map((t) => ({ label: t.label, value: String(t.value), color: t.color }))} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Top spenders" subtitle="Your best guests this year" />
            <ul className="divide-y divide-border/60 px-5 pb-2 pt-3 sm:px-6">
              {top.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                  </div>
                  <span className="font-heading text-sm font-semibold tabular-nums text-primary">{money(c.spent, 0)}</span>
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
