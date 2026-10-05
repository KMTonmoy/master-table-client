"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  Field,
  PageHeader,
  ProgressBar,
  Toggle,
  inputClass,
} from "@/components/dashboard/ui";
import { money } from "@/lib/format";
import type { Category } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

type CategoryRow = Category & { image?: string };

const normalizeCategory = (c: any): CategoryRow => ({
  id: String(c?.id ?? c?._id ?? ""),
  name: c?.name ?? "Untitled",
  description: c?.description ?? "",
  image: c?.image ?? "",
  emoji: c?.emoji ?? "🍽️",
  items: Number(c?.items ?? 0),
  revenue: Number(c?.revenue ?? 0),
  share: Number(c?.share ?? 0),
});

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

const Categories = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`, {
        withCredentials: true,
      });
      const list = (Array.isArray(data) ? data : []).map(normalizeCategory);
      setCategories(list);
      setVisible((prev) => ({
        ...Object.fromEntries(list.map((c) => [c.id, true])),
        ...prev,
      }));
      setError(null);
    } catch (err) {
      setError(extractError(err, "Failed to load categories"));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalItems = categories.reduce((a, c) => a + c.items, 0);
  const totalRevenue = categories.reduce((a, c) => a + c.revenue, 0);
  const maxShare = Math.max(...categories.map((c) => c.share), 1);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage("");
    setAdding(false);
  };

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/categories`,
        {
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
        },
        { withCredentials: true }
      );
      resetForm();
      await load();
    } catch (err) {
      setError(extractError(err, "Failed to create category"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`, {
        withCredentials: true,
      });
    } catch {
      await load();
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description={
          loading
            ? "Loading categories…"
            : `${categories.length} categories with ${totalItems} items. ${money(totalRevenue, 0)} in sales this month.`
        }
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setAdding((v) => !v)}
          >
            New category
          </Button>
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
            <Field
              label="Category name"
              hint="Guests see this name on the menu."
            >
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="For example, Weekend specials"
                autoFocus
              />
            </Field>
            <Field label="Description">
              <input
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short line about this category"
              />
            </Field>
            <Field
              label="Image URL"
              hint="Paste a Cloudinary or direct image URL."
            >
              <input
                className={inputClass}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://res.cloudinary.com/…/category.jpg"
              />
            </Field>
          </div>

          {image.trim() && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
              <img
                src={image.trim()}
                alt="Preview"
                className="h-40 w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              disabled={!name.trim() || saving}
              onClick={submit}
            >
              {saving ? "Saving…" : "Save category"}
            </Button>
            <Button variant="ghost" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-72 animate-pulse bg-foreground/5">
                <span className="sr-only">Loading…</span>
              </Card>
            ))
          : categories.map((c) => (
              <Card key={c.id} className="flex flex-col overflow-hidden">
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <Toggle
                      checked={visible[c.id] ?? true}
                      onChange={(v) =>
                        setVisible((s) => ({ ...s, [c.id]: v }))
                      }
                      label={`Show ${c.name} on the menu`}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {c.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {c.description || "No description yet."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-foreground/5 px-4 py-3">
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="font-heading text-xl font-bold text-foreground">
                        {c.items}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-foreground/5 px-4 py-3">
                      <p className="text-xs text-muted-foreground">Sales</p>
                      <p className="font-heading text-xl font-bold text-foreground">
                        {money(c.revenue, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                      <span>Share of revenue</span>
                      <span className="font-medium text-foreground">
                        {c.share}%
                      </span>
                    </div>
                    <ProgressBar value={(c.share / maxShare) * 100} />
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      className="flex-1"
                      onClick={() => remove(c.id)}
                    >
                      Delete
                    </Button>
                  </div>
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