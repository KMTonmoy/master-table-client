"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, PageHeader, ProgressBar, Toggle, inputClass } from "@/components/dashboard/ui";
import { categories, money } from "@/lib/dashboard-data";

const Categories = () => {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.id, true])),
  );
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const totalItems = categories.reduce((a, c) => a + c.items, 0);
  const totalRevenue = categories.reduce((a, c) => a + c.revenue, 0);
  const maxShare = Math.max(...categories.map((c) => c.share));

  return (
    <>
      <PageHeader
        title="Categories"
        description={`${categories.length} categories with ${totalItems} items. ${money(totalRevenue, 0)} in sales this month.`}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setAdding((v) => !v)}>
            New category
          </Button>
        }
      />

      {adding && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[240px] flex-1">
              <Field label="Category name" hint="Guests see this name on the menu.">
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="For example, Weekend specials"
                  autoFocus
                />
              </Field>
            </div>
            <div className="flex gap-2 pb-6">
              <Button variant="primary" disabled={!name.trim()} onClick={() => { setAdding(false); setName(""); }}>
                Save category
              </Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setName(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {categories.map((c) => (
          <Card key={c.id} className="flex flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-3xl ring-1 ring-inset ring-primary/25">
                {c.emoji}
              </span>
              <Toggle
                checked={visible[c.id]}
                onChange={(v) => setVisible((s) => ({ ...s, [c.id]: v }))}
                label={`Show ${c.name} on the menu`}
              />
            </div>

            <h3 className="mt-4 font-heading text-xl font-semibold text-foreground">{c.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-foreground/5 px-4 py-3">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-heading text-xl font-bold text-foreground">{c.items}</p>
              </div>
              <div className="rounded-2xl bg-foreground/5 px-4 py-3">
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="font-heading text-xl font-bold text-foreground">{money(c.revenue, 0)}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Share of revenue</span>
                <span className="font-medium text-foreground">{c.share}%</span>
              </div>
              <ProgressBar value={(c.share / maxShare) * 100} />
            </div>

            <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
              <Button size="sm" icon={Pencil} className="flex-1">
                Edit
              </Button>
              <Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${c.name}`} />
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium">Add a category</span>
        </button>
      </div>
    </>
  );
};

export default Categories;
