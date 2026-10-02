"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const SERVICE_RATE = 0.05;
const FREE_DELIVERY_MIN = 40;

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-border bg-card/70 p-8 text-center backdrop-blur-xl sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ShoppingCart className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">
            Sign in to view your cart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your cart is saved to your account so you can pick up where you left
            off on any device.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (successId) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/70 p-8 text-center backdrop-blur-xl sm:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-5 font-heading text-3xl font-bold text-foreground">
              Order placed
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Your order{" "}
              <span className="font-semibold text-primary">{successId}</span> is
              now in the kitchen.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/account/orders"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
              >
                View my orders
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/menu"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Back to menu
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <ShoppingCart className="h-3.5 w-3.5" />
            Cart
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Your cart
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {cart.count === 0
              ? "Add dishes from the menu to get started."
              : `${cart.count} item${cart.count === 1 ? "" : "s"} ready to order.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label="Refresh cart"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {cart.items.length > 0 && (
            <button
              type="button"
              onClick={() => void handleClear()}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear cart
            </button>
          )}
        </div>
      </motion.header>

      {unavailableItems.length > 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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

      <AnimatePresence>
        {placingError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-8 rounded-3xl border border-border bg-card/70 p-10 text-center backdrop-blur-xl sm:p-16"
        >
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ShoppingBag className="h-9 w-9" />
          </span>
          <h2 className="mt-6 font-heading text-2xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="mt-2 mx-auto max-w-md text-base text-muted-foreground">
            Browse the menu and add a few dishes — they&apos;ll show up here.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
          >
            Explore the menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <motion.ul
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-3"
          >
            <AnimatePresence initial={false}>
              {cart.items.map((item) => {
                const busy = busyId === item.productId;
                return (
                  <motion.li
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -32 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn(
                      "relative overflow-hidden rounded-3xl border bg-card/70 p-4 backdrop-blur-xl sm:p-5",
                      item.available
                        ? "border-border"
                        : "border-amber-500/40 bg-amber-500/5",
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent sm:h-24 sm:w-24">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className={cn(
                              "h-full w-full object-cover",
                              !item.available && "opacity-50 grayscale",
                            )}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-4xl">
                            {item.emoji}
                          </span>
                        )}
                      </div>

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
                              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {item.reason}
                              </p>
                            )}

                            {item.available && item.priceChanged && (
                              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
                                Price updated
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={busy}
                            aria-label={`Remove ${item.name} from cart`}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-border bg-background">
                            <button
                              type="button"
                              onClick={() => decrease(item)}
                              aria-label={`Decrease ${item.name} quantity`}
                              disabled={!item.available || busy}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="h-9 w-12 text-center text-sm font-semibold tabular-nums leading-9 text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increase(item)}
                              aria-label={`Increase ${item.name} quantity`}
                              disabled={!item.available || busy}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <p
                            className={cn(
                              "font-heading text-lg font-bold tabular-nums",
                              item.available
                                ? "text-primary"
                                : "text-muted-foreground line-through",
                            )}
                          >
                            {money(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          <motion.aside
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl">
              <div className="border-b border-border/70 px-6 py-5">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Order summary
                  </h2>
                </div>
              </div>

              <dl className="space-y-3 px-6 py-5 text-sm">
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
                  <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs text-primary">
                    <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Add {money(FREE_DELIVERY_MIN - subtotal)} more for free
                      delivery
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 font-heading text-lg font-bold text-foreground">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(total)}</dd>
                </div>
              </dl>

              <div className="border-t border-border/70 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placing || availableItems.length === 0}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    <>
                      Place order
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {availableItems.length === 0 && cart.items.length > 0 && (
                  <p className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400">
                    Remove unavailable items to continue.
                  </p>
                )}

                <Link
                  href="/menu"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
