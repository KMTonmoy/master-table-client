"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import { money } from "@/lib/format";
import type { Category } from "@/types/dashboard.types";
import type {
  Product,
  ProductFormValues,
  ProductRow,
  ProductStatus,
} from "@/types/products.types";
import AddProductModal, {
  type EditableProduct,
} from "@/components/dashboard/AddProductModal";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const STATUSES: ("All" | ProductStatus)[] = [
  "All",
  "Active",
  "Low stock",
  "Out of stock",
  "Draft",
];

const normalizeProduct = (
  p: Partial<Product> & { _id?: string },
): ProductRow => ({
  id: String(p.id ?? p._id ?? ""),
  name: p.name ?? "Unnamed",
  category: p.category ?? "",
  price: Number(p.price ?? 0),
  stock: Number(p.stock ?? 0),
  sold: Number(p.sold ?? 0),
  rating: Number(p.rating ?? 0),
  emoji: p.emoji ?? "🍽️",
  status: (p.status ?? "Draft") as ProductStatus,
  images: Array.isArray(p.images) ? p.images : [],
  description: p.description ?? "",
  ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
  diet: p.diet ?? "",
  cuisine: p.cuisine ?? "",
  spiceLevel: Number(p.spiceLevel ?? 0),
  prepTime: Number(p.prepTime ?? 0),
  calories: Number(p.calories ?? 0),
  tags: Array.isArray(p.tags) ? p.tags : [],
  isFeatured: !!p.isFeatured,
  isAvailable: p.isAvailable !== false,
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

const Products = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"All" | ProductStatus>("All");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { withCredentials: true }),
          axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
        ]);
        if (cancelled) return;
        setProducts(
          (Array.isArray(pRes.data) ? pRes.data : []).map(normalizeProduct),
        );
        setCategories(Array.isArray(cRes.data) ? cRes.data : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(extractError(err, "Failed to load products"));
        setProducts([]);
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
      const [pRes, cRes] = await Promise.all([
        axios.get(`${API_URL}/api/products`, { withCredentials: true }),
        axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
      ]);
      setProducts(
        (Array.isArray(pRes.data) ? pRes.data : []).map(normalizeProduct),
      );
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
      setError(null);
    } catch (err) {
      setError(extractError(err, "Failed to refresh products"));
    }
  };

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (status === "All" || p.status === status) &&
          p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query, category, status],
  );

  const summary = [
    { label: "All products", value: products.length },
    {
      label: "Active",
      value: products.filter((p) => p.status === "Active").length,
    },
    {
      label: "Low stock",
      value: products.filter((p) => p.status === "Low stock").length,
    },
    {
      label: "Out of stock",
      value: products.filter((p) => p.status === "Out of stock").length,
    },
  ];

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditing(p);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const buildPayload = (form: ProductFormValues) => ({
    name: form.name,
    description: form.description,
    price: Number(form.price),
    category: form.category,
    diet: form.diet,
    cuisine: form.cuisine,
    images: form.images.filter(Boolean),
    ingredients: form.ingredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    tags: form.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    spiceLevel: Number(form.spiceLevel || 0),
    prepTime: Number(form.prepTime || 0),
    calories: Number(form.calories || 0),
    isFeatured: form.isFeatured,
    isAvailable: form.isAvailable,
    status: form.isAvailable ? "Active" : "Draft",
  });

  const handleCreate = async (form: ProductFormValues) => {
    await axios.post(
      `${API_URL}/api/products`,
      {
        ...buildPayload(form),
        stock: 0,
        emoji: "🍽️",
      },
      { withCredentials: true },
    );
    await reload();
  };

  const handleUpdate = async (form: ProductFormValues) => {
    if (!editing) return;
    await axios.patch(
      `${API_URL}/api/products/${editing.id}`,
      buildPayload(form),
      { withCredentials: true },
    );
    await reload();
  };

  const handleSubmit = async (form: ProductFormValues) => {
    if (editing) return handleUpdate(form);
    return handleCreate(form);
  };

  const remove = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        withCredentials: true,
      });
    } catch {
      await reload();
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Every dish and drink on your menu. Edit prices, watch stock and hide items that are not available."
        actions={
          <>
            <Button icon={Download}>Export</Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Add product
            </Button>
          </>
        }
      />

      {error && (
        <Card className="border-destructive/40 p-5 text-sm text-destructive">
          Could not reach the API: {error}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="rounded-2xl px-5 py-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-foreground">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search dishes"
            className="w-full sm:w-72"
          />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-52"
            aria-label="Category"
          >
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
        </div>

        {loading ? (
          <div className="space-y-2 border-t border-border/70 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 w-full animate-pulse rounded-xl bg-foreground/5"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No dishes match"
            hint="Try a different search, or clear the category and status filters."
          />
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
                  <Th>Rating</Th>
                  <Th>Status</Th>
                  <Th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-foreground/[0.03]"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-11 w-11 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-xl">
                            {p.emoji}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.id}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-muted-foreground">{p.category}</Td>
                    <Td className="font-medium tabular-nums">
                      {money(p.price)}
                    </Td>
                    <Td className="tabular-nums">
                      <span
                        className={
                          Number(p.stock ?? 0) === 0
                            ? "text-destructive"
                            : Number(p.stock ?? 0) <= 10
                              ? "text-amber-500"
                              : ""
                        }
                      >
                        {Number(p.stock ?? 0)}
                      </span>
                    </Td>
                    <Td className="tabular-nums">
                      {Number(p.sold ?? 0).toLocaleString()}
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {Number(p.rating ?? 0).toFixed(1)}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={productTone(p.status)}>{p.status}</Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          aria-label={`Edit ${p.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          aria-label={`Delete ${p.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
        </div>
      </Card>

      <AddProductModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        categories={categories.map((c) => c.name)}
        product={editing as EditableProduct | null}
        mode={editing ? "edit" : "create"}
      />
    </>
  );
};

export default Products;
