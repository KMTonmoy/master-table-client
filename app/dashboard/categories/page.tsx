"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, PageHeader, ProgressBar, Toggle, inputClass } from "@/components/dashboard/ui";
import { money } from "@/lib/dashboard-data";
import { api } from "@/lib/api";
import type { Category } from "@/types/dashboard.types";

const EMOJI_OPTIONS = ["🍽️", "🔥", "🥗", "🦐", "🫓", "🍮", "🥟", "🍷"];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = () => {
    setLoading(true);
    api
      .categories()
      .then((list) => {
        setCategories(list);
        setVisible((prev) => ({ ...Object.fromEntries(list.map((c) => [c.id, true])), ...prev }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totalItems = categories.reduce((a, c) => a + c.items, 0);
  const totalRevenue = categories.reduce((a, c) => a + c.revenue, 0);
  const maxShare = Math.max(...categories.map((c) => c.share), 1);

  const submit = async () => {
    if (!name.trim()) return;
    await api.createCategory({ name, description, emoji: EMOJI_OPTIONS[categories.length % EMOJI_OPTIONS.length] });
    setName("");
    setDescription("");
    setAdding(false);
    load();
  };

  const remove = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteCategory(id);
    } catch {
      load();
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description={loading ? "Loading categories…" : `${categories.length} categories with ${totalItems} items. ${money(totalRevenue, 0)} in sales this month.`}
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
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="For example, Weekend specials" autoFocus />
              </Field>
            </div>
            <div className="min-w-[240px] flex-1">
              <Field label="Description">
                <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short line about this category" />
              </Field>
            </div>
            <div className="flex gap-2 pb-6">
              <Button variant="primary" disabled={!name.trim()} onClick={submit}>
                Save category
              </Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-72 animate-pulse bg-foreground/5" />)
          : categories.map((c) => (
              <Card key={c.id} className="flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-3xl ring-1 ring-inset ring-primary/25">
                    {c.emoji}
                  </span>
                  <Toggle
                    checked={visible[c.id] ?? true}
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
                  <Button size="sm" variant="danger" icon={Trash2} className="flex-1" onClick={() => remove(c.id)}>
                    Delete
                  </Button>
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
