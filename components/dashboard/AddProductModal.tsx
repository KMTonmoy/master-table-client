"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button, Field, Select, inputClass } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { imageUpload } from "@/lib";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  images: string[];
  ingredients: string;
  diet: "veg" | "non-veg" | "vegan" | "";
  category: string;
  cuisine: string;
  spiceLevel: string;
  prepTime: string;
  calories: string;
  tags: string;
  isFeatured: boolean;
  isAvailable: boolean;
};

export type EditableProduct = Partial<ProductFormValues> & {
  id?: string;
  ingredients?: string | string[];
  tags?: string | string[];
};

const emptyForm: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  images: ["", "", "", ""],
  ingredients: "",
  diet: "",
  category: "",
  cuisine: "",
  spiceLevel: "0",
  prepTime: "",
  calories: "",
  tags: "",
  isFeatured: false,
  isAvailable: true,
};

const toForm = (p?: EditableProduct | null): ProductFormValues => {
  if (!p) return emptyForm;
  const imgs = Array.isArray(p.images) ? [...p.images] : [];
  while (imgs.length < 4) imgs.push("");
  return {
    name: p.name ?? "",
    description: p.description ?? "",
    price: p.price != null ? String(p.price) : "",
    images: imgs.slice(0, 8),
    ingredients: Array.isArray(p.ingredients)
      ? p.ingredients.join(", ")
      : (p.ingredients ?? ""),
    diet: (p.diet as ProductFormValues["diet"]) ?? "",
    category: p.category ?? "",
    cuisine: p.cuisine ?? "",
    spiceLevel: p.spiceLevel != null ? String(p.spiceLevel) : "0",
    prepTime: p.prepTime != null ? String(p.prepTime) : "",
    calories: p.calories != null ? String(p.calories) : "",
    tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags ?? ""),
    isFeatured: !!p.isFeatured,
    isAvailable: p.isAvailable !== false,
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => Promise<void> | void;
  categories?: string[];
  product?: EditableProduct | null;
  mode?: "create" | "edit";
};

const AddProductModal = (props: Props) => {
  if (!props.open) return null;
  const key = props.product?.id ?? "new";
  return <AddProductModalInner key={key} {...props} />;
};

const AddProductModalInner = ({
  onClose,
  onSubmit,
  categories = [],
  product = null,
  mode = "create",
}: Props) => {
  const [form, setForm] = useState<ProductFormValues>(() => toForm(product));
  const [saving, setSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handlePickImage = (slot: number) => {
    setUploadingSlot(slot);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slot = uploadingSlot;
    e.target.value = "";
    if (!file || slot === null) return;

    setUploadError(null);
    setUploadingSlot(slot);

    try {
      const url = await imageUpload(file);
      setForm((f) => {
        const next = [...f.images];
        next[slot] = url;
        return { ...f, images: next };
      });
      setPreviewIndex(slot);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(msg);
    } finally {
      setUploadingSlot(null);
    }
  };

  const clearImage = (slot: number) => {
    setForm((f) => {
      const next = [...f.images];
      next[slot] = "";
      return { ...f, images: next };
    });
  };

  const addImageSlot = () => {
    if (form.images.length >= 8) return;
    setForm((f) => ({ ...f, images: [...f.images, ""] }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.category || !form.diet)
      return;
    if (uploadingSlot !== null) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const validImages = form.images.filter(Boolean);
  const activePreview = validImages[previewIndex] || validImages[0] || "";
  const isEdit = mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEdit ? "Edit product" : "Add new product"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Update details and photos"
                : "Fill in details and upload up to 4 photos"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Field label="Dish name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Butter Chicken"
                autoFocus
              />
            </Field>

            <Field label="Description">
              <textarea
                className={cn(inputClass, "min-h-[80px] resize-y")}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Tandoor-charred chicken simmered in a velvety tomato-cashew gravy."
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="9.50"
                />
              </Field>
              <Field label="Diet">
                <Select
                  value={form.diet}
                  onChange={(e) =>
                    update("diet", e.target.value as ProductFormValues["diet"])
                  }
                >
                  <option value="">Select diet</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-veg</option>
                  <option value="vegan">Vegan</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="food">Food</option>
                  <option value="drinks">Drinks</option>
                  <option value="dessert">Dessert</option>
                </Select>
              </Field>
              <Field label="Cuisine">
                <input
                  className={inputClass}
                  value={form.cuisine}
                  onChange={(e) => update("cuisine", e.target.value)}
                  placeholder="Indian"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Spice (0-5)">
                <input
                  type="number"
                  min={0}
                  max={5}
                  className={inputClass}
                  value={form.spiceLevel}
                  onChange={(e) => update("spiceLevel", e.target.value)}
                />
              </Field>
              <Field label="Prep (min)">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.prepTime}
                  onChange={(e) => update("prepTime", e.target.value)}
                  placeholder="35"
                />
              </Field>
              <Field label="Calories">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.calories}
                  onChange={(e) => update("calories", e.target.value)}
                  placeholder="490"
                />
              </Field>
            </div>

            <Field label="Ingredients (comma separated)">
              <input
                className={inputClass}
                value={form.ingredients}
                onChange={(e) => update("ingredients", e.target.value)}
                placeholder="Chicken, Tomato, Cashew, Butter"
              />
            </Field>

            <Field label="Tags (comma separated)">
              <input
                className={inputClass}
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="bestseller, creamy, tandoor"
              />
            </Field>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => update("isFeatured", e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => update("isAvailable", e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Available
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Photos</p>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
              {activePreview ? (
                <img
                  src={activePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Upload up to 4 photos
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {form.images.map((img, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border transition-colors",
                    previewIndex === idx
                      ? "border-primary"
                      : "border-border/70",
                  )}
                >
                  {img ? (
                    <>
                      <img
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full cursor-pointer object-cover"
                        onClick={() => setPreviewIndex(idx)}
                      />
                      <button
                        type="button"
                        onClick={() => clearImage(idx)}
                        aria-label="Remove"
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePickImage(idx)}
                      disabled={uploadingSlot !== null}
                      className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-60"
                    >
                      {uploadingSlot === idx ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      <span className="text-[10px]">Slot {idx + 1}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}

            {form.images.length < 8 && (
              <button
                type="button"
                onClick={addImageSlot}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add another slot
              </button>
            )}

            <p className="text-xs text-muted-foreground">
              Tip: paste a URL below any slot instead of uploading a file.
            </p>
            <div className="space-y-2">
              {form.images.map((img, idx) => (
                <input
                  key={`url-${idx}`}
                  className={inputClass}
                  value={img}
                  onChange={(e) => {
                    const next = [...form.images];
                    next[idx] = e.target.value;
                    setForm((f) => ({ ...f, images: next }));
                  }}
                  placeholder={`Image URL ${idx + 1}`}
                />
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/70 px-5 py-4 sm:px-6">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              saving ||
              uploadingSlot !== null ||
              !form.name.trim() ||
              !form.price ||
              !form.category ||
              !form.diet
            }
          >
            {saving ? "Saving…" : isEdit ? "Update product" : "Save product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
