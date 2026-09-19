"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, MoreHorizontal, Pencil, Plus, Star } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
  Select,
  Table,
  Td,
  Th,
  productTone,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { categories, money, products } from "@/lib/dashboard-data";
import type { ProductStatus } from "@/types/dashboard.types";

const STATUSES: ("All" | ProductStatus)[] = ["All", "Active", "Low stock", "Out of stock", "Draft"];

const Products = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"All" | ProductStatus>("All");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (status === "All" || p.status === status) &&
          p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, category, status],
  );

  const summary = [
    { label: "All products", value: products.length },
    { label: "Active", value: products.filter((p) => p.status === "Active").length },
    { label: "Low stock", value: products.filter((p) => p.status === "Low stock").length },
    { label: "Out of stock", value: products.filter((p) => p.status === "Out of stock").length },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Every dish and drink on your menu. Edit prices, watch stock and hide items that are not available."
        actions={
          <>
            <Button icon={Download}>Export</Button>
            <Button variant="primary" icon={Plus}>
              Add product
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="rounded-2xl px-5 py-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <SearchInput value={query} onChange={setQuery} placeholder="Search dishes" className="w-full sm:w-72" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full sm:w-52" aria-label="Category">
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as "All" | ProductStatus)}
            className="w-full sm:w-44"
            aria-label="Status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "Any status" : s}
              </option>
            ))}
          </Select>

          <div className="ml-auto inline-flex rounded-full border border-border bg-card/60 p-1">
            {(
              [
                { v: "grid", icon: LayoutGrid, label: "Grid view" },
                { v: "table", icon: List, label: "Table view" },
              ] as const
            ).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                type="button"
                aria-label={label}
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "inline-flex h-8 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  view === v ? "bg-primary text-[#2B1B10]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No dishes match" hint="Try a different search, or clear the category and status filters." />
        ) : view === "grid" ? (
          <div className="grid gap-4 border-t border-border/70 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/40 transition-colors hover:border-primary/40"
              >
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
                  <span className="text-6xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{p.emoji}</span>
                  <div className="absolute left-3 top-3">
                    <Badge tone={productTone(p.status)}>{p.status}</Badge>
                  </div>
                  <button
                    type="button"
                    aria-label={`More actions for ${p.name}`}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-muted-foreground backdrop-blur hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <h3 className="mt-0.5 font-heading text-lg font-semibold text-foreground">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-heading text-xl font-bold text-primary">{money(p.price)}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {p.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span>{p.sold.toLocaleString()} sold</span>
                    <span>{p.stock} in stock</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-t border-border/70">
            <Table>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Sold</Th>
                  <Th>Status</Th>
                  <Th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-foreground/[0.03]">
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-xl">{p.emoji}</span>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.id}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-muted-foreground">{p.category}</Td>
                    <Td className="tabular-nums">{money(p.price)}</Td>
                    <Td className="tabular-nums">{p.stock}</Td>
                    <Td className="tabular-nums">{p.sold.toLocaleString()}</Td>
                    <Td>
                      <Badge tone={productTone(p.status)}>{p.status}</Badge>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        aria-label={`Edit ${p.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
          <span>
            Showing {filtered.length} of {products.length} products
          </span>
          <div className="flex gap-2">
            <Button size="sm" disabled>
              Previous
            </Button>
            <Button size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Products;
