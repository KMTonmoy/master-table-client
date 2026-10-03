"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import AuthModal from "@/components/layout/auth-modal";
import type { AuthMode, AuthUser } from "@/types/auth.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

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
const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.08, filter: "blur(12px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: EASE },
  },
};

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
          : "border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400",
      )}
    >
      <span
        className={cn(
          "inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border",
          isVeg ? "border-green-600" : "border-red-600",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isVeg ? "bg-green-600" : "bg-red-600",
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
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
    className="rounded-2xl border border-white/60 bg-white/15 p-3 backdrop-blur-md transition-colors duration-500 hover:border-[#E0A526]/40 dark:border-white/10 dark:bg-white/5"
  >
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-[11px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="mt-1 text-sm font-semibold capitalize text-foreground">
      {value}
    </div>
  </motion.div>
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
            : "text-foreground hover:bg-white/40 active:scale-95 dark:hover:bg-white/20",
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
            : "text-foreground hover:bg-white/40 active:scale-95 dark:hover:bg-white/20",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

type AddedState = "idle" | "adding" | "added";

const MenuDetails = () => {
  const router = useRouter();
  const params = useParams();
  const { add: addCart } = useCart();

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
  const [addState, setAddState] = useState<AddedState>("idle");
  const [buying, setBuying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(
    null,
  );

  // Scroll to top before paint — prevents bottom flash on navigation
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<Dish>(`${API_URL}/products/${id}`);
        if (cancelled) return;
        setDish(data);
        setActiveImage(0);
        setError(false);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
          `${API_URL}/api/auth/me`,
          { withCredentials: true },
        );
        if (cancelled) return;
        setUser(data?.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authOpen]);

  const openAuth = (mode: AuthMode, action: "add" | "buy") => {
    setPendingAction(action);
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setPendingAction(null);
  };

  const runAdd = async () => {
    if (!dish || dish.isAvailable === false) return;

    setActionError(null);
    setAddState("adding");

    try {
      await addCart(dish._id, quantity);
      setAddState("added");
      window.setTimeout(() => setAddState("idle"), 1800);
    } catch (err) {
      setAddState("idle");
      setActionError(
        err instanceof Error ? err.message : "Failed to add to cart",
      );
    }
  };

  const runBuy = async () => {
    if (!dish || dish.isAvailable === false) return;

    setActionError(null);
    setBuying(true);

    try {
      await addCart(dish._id, quantity);
      router.push("/cart");
    } catch (err) {
      setBuying(false);
      setActionError(
        err instanceof Error ? err.message : "Failed to add to cart",
      );
    }
  };

  const handleAddToCart = async () => {
    if (!dish || dish.isAvailable === false) return;

    if (!authChecked) return;

    if (!user) {
      openAuth("login", "add");
      return;
    }

    await runAdd();
  };

  const handleBuyNow = async () => {
    if (!dish || dish.isAvailable === false) return;

    if (!authChecked) return;

    if (!user) {
      openAuth("login", "buy");
      return;
    }

    await runBuy();
  };

  const handleAuthSuccess = async () => {
    const action = pendingAction;
    setAuthOpen(false);
    setPendingAction(null);

    if (action === "add") {
      await runAdd();
    } else if (action === "buy") {
      await runBuy();
    }
  };

  if (!id) {
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
  const isAvailable = dish.isAvailable !== false;

  return (
    <>
      <section className="section relative overflow-hidden">
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: EASE }}
          className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-[#E0A526]/15 blur-[100px]"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.2 }}
          className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#C78E1E]/15 blur-[120px]"
        />

        <div className="content-wrap relative px-5 py-8">
          <motion.button
            type="button"
            onClick={() => router.back()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </motion.button>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-8 lg:grid-cols-2 lg:gap-12"
          >
            <motion.div variants={fadeUp} className="space-y-4">
              <motion.div
                variants={imageReveal}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/15 shadow-[0_20px_60px_-20px_rgba(74,46,32,0.35)] backdrop-blur-2xl"
              >
                <motion.div
                  aria-hidden
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E0A526]/30 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[1px] z-20 rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={dish.images[activeImage]}
                      alt={`${dish.name} — image ${activeImage + 1}`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute left-3 top-3 z-30 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/60 bg-white/25 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                    {dish.category.charAt(0).toUpperCase() +
                      dish.category.slice(1)}
                  </span>
                  {dish.isFeatured && (
                    <span className="rounded-full border border-amber-200/70 bg-gradient-to-br from-amber-300 to-[#E0A526] px-3 py-1 text-[11px] font-semibold text-amber-950 shadow-[0_0_12px_rgba(224,165,38,0.5)] backdrop-blur-md">
                      ★ Featured
                    </span>
                  )}
                </div>
              </motion.div>

              {dish.images.length > 1 && (
                <motion.div
                  variants={container}
                  className="grid grid-cols-4 gap-2.5"
                >
                  {dish.images.map((img, i) => (
                    <motion.button
                      key={img + i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`View image ${i + 1}`}
                      variants={fadeUp}
                      whileHover={{
                        y: -4,
                        transition: { duration: 0.3, ease: EASE },
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-2xl border bg-white/10 backdrop-blur-md transition-all duration-300",
                        activeImage === i
                          ? "border-[#E0A526] ring-2 ring-[#E0A526]/40"
                          : "border-white/50 hover:border-white/80",
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
                            : "opacity-80 group-hover:opacity-100",
                        )}
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col">
              <motion.div
                variants={container}
                className="flex flex-wrap items-start justify-between gap-3"
              >
                <motion.h1
                  variants={fadeUp}
                  className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl"
                >
                  {dish.name}
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: EASE, delay: 0.6 }}
                    style={{ transformOrigin: "left" }}
                    className="mt-2 block h-[3px] w-20 rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
                  />
                </motion.h1>
                <motion.div variants={fadeUp}>
                  <DietBadge diet={dish.diet} />
                </motion.div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
              >
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
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-5 leading-relaxed text-muted-foreground"
              >
                {dish.description}
              </motion.p>

              <motion.div
                variants={container}
                className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
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
              </motion.div>

              {dish.ingredients && dish.ingredients.length > 0 && (
                <motion.div variants={fadeUp} className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Ingredients
                  </h2>
                  <motion.ul
                    variants={container}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {dish.ingredients.map((ing) => (
                      <motion.li
                        key={ing}
                        variants={fadeUp}
                        whileHover={{
                          y: -2,
                          transition: { duration: 0.25, ease: EASE },
                        }}
                        className="rounded-full border border-white/60 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-md transition-colors duration-300 hover:border-[#E0A526]/40 dark:border-white/15 dark:bg-white/5"
                      >
                        {ing}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              )}

              {dish.tags && dish.tags.length > 0 && (
                <motion.div variants={fadeUp} className="mt-6">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Tags
                  </h2>
                  <motion.ul
                    variants={container}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {dish.tags.map((tag) => (
                      <motion.li
                        key={tag}
                        variants={fadeUp}
                        whileHover={{
                          y: -2,
                          transition: { duration: 0.25, ease: EASE },
                        }}
                        className="rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3 py-1 text-xs font-semibold text-[#E0A526]"
                      >
                        #{tag}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              )}

              <motion.div
                variants={fadeUp}
                className="relative mt-8 overflow-hidden rounded-3xl border border-white/60 bg-white/15 p-5 shadow-[0_20px_60px_-20px_rgba(74,46,32,0.35)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
                />
                <motion.div
                  aria-hidden
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(224,165,38,0.35),transparent_70%)] blur-2xl"
                />

                <div className="relative flex flex-col gap-5">
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
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={subtotal}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="block font-heading text-2xl font-bold text-[#E0A526]"
                        >
                          ${subtotal.toFixed(2)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

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

                  {actionError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      {actionError}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <motion.button
                      type="button"
                      disabled={!isAvailable || addState !== "idle"}
                      onClick={handleAddToCart}
                      whileHover={
                        !isAvailable || addState !== "idle"
                          ? undefined
                          : { scale: 1.02 }
                      }
                      whileTap={
                        !isAvailable || addState !== "idle"
                          ? undefined
                          : { scale: 0.98 }
                      }
                      transition={{ duration: 0.3, ease: EASE }}
                      className={cn(
                        "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/25 px-6 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md backdrop-saturate-150 transition-colors duration-300",
                        "hover:bg-white/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20",
                        (!isAvailable || addState !== "idle") &&
                          "cursor-not-allowed opacity-70",
                      )}
                    >
                      {addState === "adding" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding…
                        </>
                      ) : addState === "added" ? (
                        <>
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 22,
                            }}
                            className="inline-flex"
                          >
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </motion.span>
                          Added to cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          Add to cart
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      disabled={!isAvailable || buying}
                      onClick={handleBuyNow}
                      whileHover={
                        !isAvailable || buying ? undefined : { scale: 1.02 }
                      }
                      whileTap={
                        !isAvailable || buying ? undefined : { scale: 0.98 }
                      }
                      transition={{ duration: 0.3, ease: EASE }}
                      className={cn(
                        "group/btn relative inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-6 text-sm font-semibold text-white",
                        "shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]",
                        "hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        (!isAvailable || buying) &&
                          "cursor-not-allowed opacity-70",
                      )}
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                      {buying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Buy now
                        </>
                      )}
                    </motion.button>
                  </div>

                  {!isAvailable && (
                    <p className="text-center text-xs font-medium text-muted-foreground">
                      This item is currently unavailable.
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={closeAuth}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default MenuDetails;