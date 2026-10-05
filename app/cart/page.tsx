"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { useCart } from "@/components/providers/cart-provider";
import type { CartItem } from "@/types/cart.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

const SERVICE_RATE = 0.05;
const FREE_DELIVERY_MIN = 40;
const EASE = [0.22, 1, 0.36, 1] as const;

const headerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

const itemReveal: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
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

const CartPage = () => {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { cart, loading, user, authChecked, refresh, update, remove, clear } =
    useCart();

  const [placing, setPlacing] = useState(false);
  const [placingError, setPlacingError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const availableItems = useMemo(
    () => cart.items.filter((i) => i.available),
    [cart.items],
  );
  const unavailableItems = useMemo(
    () => cart.items.filter((i) => !i.available),
    [cart.items],
  );

  const subtotal = cart.subtotal;
  const serviceCharge = subtotal * SERVICE_RATE;
  const deliveryFee =
    subtotal >= FREE_DELIVERY_MIN || availableItems.length === 0 ? 0 : 5;
  const total = subtotal + serviceCharge + deliveryFee;

  const increase = async (item: CartItem) => {
    setBusyId(item.productId);
    try {
      await update(item.productId, item.quantity + 1);
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const decrease = async (item: CartItem) => {
    setBusyId(item.productId);
    try {
      await update(item.productId, item.quantity - 1);
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item: CartItem) => {
    setBusyId(item.productId);
    try {
      await remove(item.productId);
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all items from your cart?")) return;
    try {
      await clear();
    } catch {}
  };

  const placeOrder = async () => {
    if (availableItems.length === 0 || placing) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setPlacing(true);
    setPlacingError(null);

    try {
      const { data } = await axios.post<{ message: string; orderId: string }>(
        `${API_URL}/api/orders`,
        {
          customer: user.name,
          email: user.email,
          userId: user.id,
          channel: "Pickup",
          table: null,
          payment: "Card",
          items: availableItems.flatMap((item) =>
            Array.from({ length: item.quantity }, () => item.name),
          ),
        },
        { withCredentials: true },
      );

      await refresh();
      setSuccessId(data?.orderId ?? null);
    } catch (err) {
      setPlacingError(extractError(err, "Failed to place your order"));
    } finally {
      setPlacing(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative"
        >
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.5, 0, 0] }}
            transition={{
              duration: 2,
              ease: "easeOut",
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full border border-[#E0A526]"
          />
          <Loader2 className="h-8 w-8 animate-spin text-[#E0A526]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/70 p-8 text-center backdrop-blur-xl sm:p-10"
        >
          <motion.div
            aria-hidden
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#E0A526]/20 blur-3xl"
          />
          <div className="relative">
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
                delay: 0.2,
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526]"
            >
              <ShoppingCart className="h-8 w-8" />
            </motion.span>
            <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">
              Sign in to view your cart
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your cart is saved to your account so you can pick up where you
              left off on any device.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <Link
                href="/login"
                className="
                  group/btn relative mt-6 inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl
                  bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-6 text-sm font-semibold text-[#2B1B10]
                  shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
                  transition-shadow duration-300
                  hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
                "
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (successId) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/70 p-8 text-center backdrop-blur-xl sm:p-10"
        >
          <motion.div
            aria-hidden
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 3.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl"
          />
          <div className="relative">
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
                delay: 0.15,
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
              className="mt-5 font-heading text-3xl font-bold text-foreground"
            >
              Order placed
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
              className="mt-2 text-base text-muted-foreground"
            >
              Your order{" "}
              <span className="font-semibold text-[#E0A526]">{successId}</span>{" "}
              is now in the kitchen.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
              className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"
            >
              <Link
                href="/account/orders"
                className="group/btn relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-6 text-sm font-semibold text-[#2B1B10] shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  View my orders
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Link>
              <Link
                href="/menu"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Back to menu
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-[#E0A526]/12 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/12 blur-[120px]"
      />

      <motion.header
        variants={headerContainer}
        initial="hidden"
        animate="show"
        className="relative flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <motion.p
            variants={headerItem}
            className="inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E0A526]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Cart
          </motion.p>
          <motion.h1
            variants={headerItem}
            className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
          >
            Your cart
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
              style={{ transformOrigin: "left" }}
              className="mt-2 block h-[3px] w-20 rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
            />
          </motion.h1>
          <motion.p
            variants={headerItem}
            className="mt-3 max-w-2xl text-base text-muted-foreground"
          >
            {cart.count === 0
              ? "Add dishes from the menu to get started."
              : `${cart.count} item${cart.count === 1 ? "" : "s"} ready to order.`}
          </motion.p>
        </div>

        <motion.div variants={headerItem} className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => void refresh()}
            aria-label="Refresh cart"
            whileHover={{ scale: 1.08, rotate: 180 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition-colors hover:border-[#E0A526]/40 hover:bg-[#E0A526]/5 hover:text-[#E0A526]"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>

          {cart.items.length > 0 && (
            <motion.button
              type="button"
              onClick={() => void handleClear()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear cart
            </motion.button>
          )}
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {unavailableItems.length > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                {unavailableItems.length} item
                {unavailableItems.length === 1 ? "" : "s"} in your cart{" "}
                {unavailableItems.length === 1 ? "is" : "are"} no longer available
              </p>
              <p className="mt-0.5 text-xs opacity-90">
                Remove them to continue. Everything else is still ready to order.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {placingError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-6 overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{placingError}</span>
              <button
                type="button"
                onClick={() => setPlacingError(null)}
                aria-label="Dismiss error"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {cart.items.length === 0 ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-card/70 p-10 text-center backdrop-blur-xl sm:p-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E0A526]/15 blur-3xl"
          />
          <div className="relative">
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
                delay: 0.3,
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526] shadow-[0_0_30px_rgba(224,165,38,0.3)]"
            >
              <ShoppingBag className="h-9 w-9" />
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
              className="mt-6 font-heading text-2xl font-bold text-foreground"
            >
              Your cart is empty
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
              className="mt-2 mx-auto max-w-md text-base text-muted-foreground"
            >
              Browse the menu and add a few dishes — they&apos;ll show up here.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 inline-block"
            >
              <Link
                href="/menu"
                className="group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-6 text-sm font-semibold text-[#2B1B10] shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  Explore the menu
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="relative mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <motion.ul
            variants={headerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence initial={false}>
              {cart.items.map((item) => {
                const busy = busyId === item.productId;
                return (
                  <motion.li
                    key={item.productId}
                    layout
                    variants={itemReveal}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, x: -32, filter: "blur(6px)" }}
                    whileHover={{
                      y: -3,
                      transition: { duration: 0.3, ease: EASE },
                    }}
                    className={cn(
                      "group relative overflow-hidden rounded-3xl border bg-card/70 p-4 backdrop-blur-xl sm:p-5",
                      item.available
                        ? "border-border transition-all duration-500 hover:border-[#E0A526]/40 hover:shadow-[0_20px_50px_-20px_rgba(74,46,32,0.3)]"
                        : "border-amber-500/40 bg-amber-500/5",
                    )}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E0A526]/0 blur-3xl transition-all duration-700 group-hover:bg-[#E0A526]/20"
                    />

                    <div className="relative flex gap-4">
                      <motion.div
                        layout
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E0A526]/20 via-[#E0A526]/5 to-transparent sm:h-24 sm:w-24"
                      >
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className={cn(
                              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
                              !item.available && "opacity-50 grayscale",
                            )}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-4xl">
                            {item.emoji}
                          </span>
                        )}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                        />
                      </motion.div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {item.category && (
                              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                {item.category}
                              </p>
                            )}
                            <h3 className="mt-0.5 truncate font-heading text-lg font-semibold text-foreground">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {money(item.price)} each
                            </p>

                            {!item.available && item.reason && (
                              <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: EASE }}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                {item.reason}
                              </motion.p>
                            )}

                            {item.available && item.priceChanged && (
                              <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: EASE }}
                                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400"
                              >
                                Price updated
                              </motion.p>
                            )}
                          </div>

                          <motion.button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={busy}
                            aria-label={`Remove ${item.name} from cart`}
                            whileHover={{ scale: 1.1, rotate: 8 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-border bg-background">
                            <motion.button
                              type="button"
                              onClick={() => decrease(item)}
                              aria-label={`Decrease ${item.name} quantity`}
                              disabled={!item.available || busy}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ duration: 0.2, ease: EASE }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </motion.button>
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={item.quantity}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                className="h-9 w-12 text-center text-sm font-semibold tabular-nums leading-9 text-foreground"
                              >
                                {item.quantity}
                              </motion.span>
                            </AnimatePresence>
                            <motion.button
                              type="button"
                              onClick={() => increase(item)}
                              aria-label={`Increase ${item.name} quantity`}
                              disabled={!item.available || busy}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ duration: 0.2, ease: EASE }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>

                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.p
                              key={item.lineTotal}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.3, ease: EASE }}
                              className={cn(
                                "font-heading text-lg font-bold tabular-nums",
                                item.available
                                  ? "text-[#E0A526]"
                                  : "text-muted-foreground line-through",
                              )}
                            >
                              {money(item.lineTotal)}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          <motion.aside
            initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
              />
              <motion.div
                aria-hidden
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#E0A526]/15 blur-3xl"
              />

              <div className="relative border-b border-border/70 px-6 py-5">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#E0A526]" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Order summary
                  </h2>
                </div>
              </div>

              <dl className="relative space-y-3 px-6 py-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">
                    Subtotal ({cart.count} item
                    {cart.count === 1 ? "" : "s"})
                  </dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {money(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Service charge (5%)</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {money(serviceCharge)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd
                    className={cn(
                      "font-medium tabular-nums",
                      deliveryFee === 0 && subtotal > 0
                        ? "text-emerald-500"
                        : "text-foreground",
                    )}
                  >
                    {deliveryFee === 0 && subtotal > 0
                      ? "Free"
                      : money(deliveryFee)}
                  </dd>
                </div>

                {subtotal > 0 && subtotal < FREE_DELIVERY_MIN && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex items-start gap-2 rounded-xl border border-[#E0A526]/30 bg-[#E0A526]/5 px-3 py-2.5 text-xs text-[#E0A526]"
                  >
                    <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Add {money(FREE_DELIVERY_MIN - subtotal)} more for free
                      delivery
                    </span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 font-heading text-lg font-bold text-foreground">
                  <dt>Total</dt>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.dd
                      key={total}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="tabular-nums text-[#E0A526]"
                    >
                      {money(total)}
                    </motion.dd>
                  </AnimatePresence>
                </div>
              </dl>

              <div className="relative border-t border-border/70 p-4 sm:p-5">
                <motion.button
                  type="button"
                  onClick={placeOrder}
                  disabled={placing || availableItems.length === 0}
                  whileHover={
                    placing || availableItems.length === 0
                      ? undefined
                      : { scale: 1.02 }
                  }
                  whileTap={
                    placing || availableItems.length === 0
                      ? undefined
                      : { scale: 0.98 }
                  }
                  transition={{ duration: 0.3, ease: EASE }}
                  className="
                    group/btn relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl
                    bg-gradient-to-br from-[#E0A526] to-[#C78E1E] text-sm font-semibold text-[#2B1B10]
                    shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
                    transition-shadow duration-300
                    hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                  {placing ? (
                    <span className="relative flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing order…
                    </span>
                  ) : (
                    <span className="relative flex items-center gap-2">
                      Place order
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                  )}
                </motion.button>

                {availableItems.length === 0 && cart.items.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400"
                  >
                    Remove unavailable items to continue.
                  </motion.p>
                )}

                <Link
                  href="/menu"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:border-[#E0A526]/40 hover:bg-[#E0A526]/5 hover:text-[#E0A526]"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;