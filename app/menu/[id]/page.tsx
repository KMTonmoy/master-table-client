"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Clock,
  Flame,
  ChefHat,
  Leaf,
  ShoppingBag,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DishCategory =
  | "food"
  | "drink"
  | "soft-drink"
  | "hard-drink"
  | "beef"
  | "chicken"
  | "seafood"
  | "vegan"
  | "breakfast"
  | "snacks"
  | "dessert";

type Dish = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  ingredients?: string[];
  diet: "veg" | "non-veg" | "vegan";
  category: DishCategory;
  cuisine?: string;
  spiceLevel?: 0 | 1 | 2 | 3 | 4;
  prepTime?: number;
  calories?: number;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
};

const SPICE_LABELS = ["Mild", "Mild+", "Medium", "Spicy", "Extra spicy"];

const DietBadge = ({ diet }: { diet: Dish["diet"] }) => {
  const isVeg = diet === "veg" || diet === "vegan";
  const label =
    diet === "vegan" ? "Vegan" : isVeg ? "Vegetarian" : "Non-vegetarian";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md",
        isVeg
          ? "border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400"
          : "border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400"
      )}
    >
      <span
        className={cn(
          "inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border",
          isVeg ? "border-green-600" : "border-red-600"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isVeg ? "bg-green-600" : "bg-red-600"
          )}
        />
      </span>
      {label}
    </span>
  );
};

const MenuDetailsSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <div className="aspect-[4/3] w-full animate-pulse rounded-3xl border border-white/40 bg-white/15 backdrop-blur-2xl" />
    <div className="space-y-5">
      <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/20" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-white/20" />
      <div className="h-24 w-full animate-pulse rounded-lg bg-white/20" />
      <div className="h-16 w-full animate-pulse rounded-2xl bg-white/20" />
    </div>
  </div>
);

const MetaCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/60 bg-white/15 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-[11px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="mt-1 text-sm font-semibold capitalize text-foreground">
      {value}
    </div>
  </div>
);

const QuantityStepper = ({
  quantity,
  setQuantity,
  max = 20,
}: {
  quantity: number;
  setQuantity: (n: number) => void;
  max?: number;
}) => {
  const dec = () => setQuantity(Math.max(1, quantity - 1));
  const inc = () => setQuantity(Math.min(max, quantity + 1));

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/20 p-1 backdrop-blur-md dark:border-white/15 dark:bg-white/10">
      <button
        type="button"
        onClick={dec}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
          quantity <= 1
            ? "cursor-not-allowed text-muted-foreground/50"
            : "text-foreground hover:bg-white/40 active:scale-95 dark:hover:bg-white/20"
        )}
      >
        <Minus className="h-4 w-4" />
      </button>

      <span
        aria-live="polite"
        className="min-w-[2ch] text-center font-heading text-base font-semibold text-foreground"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={inc}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
          quantity >= max
            ? "cursor-not-allowed text-muted-foreground/50"
            : "text-foreground hover:bg-white/40 active:scale-95 dark:hover:bg-white/20"
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

const MenuDetails = () => {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    axios
      .get<Dish>(`http://localhost:8000/products/${id}`)
      .then((res) => {
        if (!cancelled) setDish(res.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!dish) return;
    console.log("Add to cart:", { id: dish._id, quantity });
  };

  const handleBuyNow = () => {
    if (!dish) return;
    console.log("Buy now:", { id: dish._id, quantity });
    router.push("/checkout");
  };

  if (loading) {
    return (
      <section className="section relative overflow-hidden">
        <div className="content-wrap relative px-5 py-10">
          <MenuDetailsSkeleton />
        </div>
      </section>
    );
  }

  if (error || !dish) {
    return (
      <section className="section relative overflow-hidden">
        <div className="content-wrap relative px-5 py-16 text-center">
          <h1 className="font-heading text-3xl font-bold">Dish not found</h1>
          <p className="mt-3 text-muted-foreground">
            We couldn&apos;t find this dish. It may have been removed.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.03] hover:bg-primary/90"
          >
            Back to menu
          </Link>
        </div>
      </section>
    );
  }

  const spiceLabel =
    dish.spiceLevel !== undefined ? SPICE_LABELS[dish.spiceLevel] : undefined;

  const subtotal = dish.price * quantity;

  return (
    <section className="section relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl dark:bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="content-wrap relative px-5 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 lg:grid-cols-2 lg:gap-12"
        >
          {/* LEFT — image carousel */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/15 shadow-[0_20px_60px_-20px_rgba(30,64,110,0.35)] backdrop-blur-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[1px] z-20 rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
              />

              <Image
                key={activeImage}
                src={dish.images[activeImage]}
                alt={`${dish.name} — image ${activeImage + 1}`}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />

              <div className="absolute left-3 top-3 z-30 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/60 bg-white/25 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                  {dish.category.charAt(0).toUpperCase() +
                    dish.category.slice(1)}
                </span>
                {dish.isFeatured && (
                  <span className="rounded-full border border-amber-200/70 bg-amber-400/80 px-3 py-1 text-[11px] font-semibold text-amber-950 shadow-sm backdrop-blur-md">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>

            {dish.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {dish.images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-2xl border bg-white/10 backdrop-blur-md transition-all duration-300",
                      activeImage === i
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-white/50 hover:border-white/80 hover:scale-[1.03]"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${dish.name} thumbnail ${i + 1}`}
                      fill
                      sizes="120px"
                      className={cn(
                        "object-cover transition-opacity duration-300",
                        activeImage === i
                          ? "opacity-100"
                          : "opacity-80 group-hover:opacity-100"
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — info */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {dish.name}
              </h1>
              <DietBadge diet={dish.diet} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {dish.rating !== undefined && (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {dish.rating.toFixed(1)}
                  <span className="text-muted-foreground">rating</span>
                </span>
              )}
              {dish.cuisine && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                  <span>{dish.cuisine} cuisine</span>
                </>
              )}
            </div>

            <p className="mt-5 leading-relaxed text-muted-foreground">
              {dish.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetaCard
                icon={<Clock className="h-4 w-4" />}
                label="Prep time"
                value={dish.prepTime ? `${dish.prepTime} min` : "—"}
              />
              <MetaCard
                icon={<Flame className="h-4 w-4" />}
                label="Spice"
                value={spiceLabel ?? "—"}
              />
              <MetaCard
                icon={<ChefHat className="h-4 w-4" />}
                label="Calories"
                value={dish.calories ? `${dish.calories} kcal` : "—"}
              />
              <MetaCard
                icon={<Leaf className="h-4 w-4" />}
                label="Category"
                value={dish.category}
              />
            </div>

            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="mt-8">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Ingredients
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {dish.ingredients.map((ing) => (
                    <li
                      key={ing}
                      className="rounded-full border border-white/60 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-md dark:border-white/15 dark:bg-white/5"
                    >
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dish.tags && dish.tags.length > 0 && (
              <div className="mt-6">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Tags
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {dish.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ Full glass action card */}
            <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/60 bg-white/15 p-5 shadow-[0_20px_60px_-20px_rgba(30,64,110,0.35)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
              {/* Glass edge highlights */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(236,244,255,0.7),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]"
              />

              <div className="relative flex flex-col gap-5">
                {/* Price + subtotal row */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Price
                    </span>
                    <span className="font-heading text-3xl font-bold text-foreground">
                      ${dish.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quantity + total bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/20 p-3 backdrop-blur-md dark:border-white/15 dark:bg-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Quantity
                    </span>
                    <QuantityStepper
                      quantity={quantity}
                      setQuantity={setQuantity}
                    />
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    Total{" "}
                    <span className="font-heading text-base font-semibold text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={!dish.isAvailable}
                    onClick={handleAddToCart}
                    className={cn(
                      "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/25 px-6 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md backdrop-saturate-150 transition-all duration-300",
                      "hover:scale-[1.02] hover:bg-white/40 active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20",
                      !dish.isAvailable && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to cart
                  </button>

                  <button
                    type="button"
                    disabled={!dish.isAvailable}
                    onClick={handleBuyNow}
                    className={cn(
                      "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-300",
                      "shadow-[0_10px_28px_-10px_rgba(74,46,32,0.5)]",
                      "hover:scale-[1.02] hover:bg-primary/90 hover:shadow-[0_14px_32px_-10px_rgba(74,46,32,0.6)] active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      !dish.isAvailable && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                    Buy now
                  </button>
                </div>

                {!dish.isAvailable && (
                  <p className="text-center text-xs font-medium text-muted-foreground">
                    This item is currently unavailable.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MenuDetails;