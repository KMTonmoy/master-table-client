"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import {
  useCart,
  type AddressInput,
} from "@/components/providers/cart-provider";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { CheckoutModal } from "@/components/cart/CheckoutModal";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const SERVICE_RATE = 0.05;
const FREE_DELIVERY_MIN = 40;

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    loading,
    user,
    authChecked,
    refresh,
    update,
    remove,
    clear,
    addresses,
    addressesLoading,
    addAddress,
    refreshAddresses,
  } = useCart();

  const [placing, setPlacing] = useState(false);
  const [placingError, setPlacingError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (selectedAddressId && addresses.some((a) => a.id === selectedAddressId))
      return;
    setSelectedAddressId(addresses[0]?.id ?? null);
  }, [addresses, selectedAddressId]);

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

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  const handleUpdateQty = async (item: any, newQty: number) => {
    setBusyId(item.productId);
    try {
      await update(item.productId, newQty);
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item: any) => {
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

  const createOrder = async (payment: "Cash" | "Card") => {
    if (availableItems.length === 0 || placing) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!selectedAddress) {
      setPlacingError("Please select a delivery address.");
      return;
    }

    setPlacing(true);
    setPlacingError(null);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/orders`,
        {
          customer: user.name,
          email: user.email,
          userId: user.id,
          channel: "Delivery",
          table: null,
          payment,
          addressId: selectedAddress.id,
          address: {
            id: selectedAddress.id,
            label: selectedAddress.label,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2,
            city: selectedAddress.city,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
            phone: selectedAddress.phone,
          },
          phone: selectedAddress.phone,
          items: availableItems.flatMap((item) =>
            Array.from({ length: item.quantity }, () => item.name),
          ),
        },
        { withCredentials: true },
      );

      const payload = (data as { data?: { orderId?: string } })?.data ?? data;
      await refresh();
      setCheckoutOpen(false);
      setSuccessId((payload as { orderId?: string })?.orderId ?? null);
    } catch (err: any) {
      setPlacingError(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E0A526]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-[#E0A526]" />
          <h1 className="mt-4 font-heading text-2xl font-bold">
            Sign in to view your cart
          </h1>
          <Link
            href="/login"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#E0A526] px-5 text-sm font-semibold text-black"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (successId) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 font-heading text-3xl font-bold">Order placed</h1>
          <p className="mt-2 text-muted-foreground">
            Order{" "}
            <span className="font-semibold text-[#E0A526]">{successId}</span> is
            in the kitchen.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/account/orders"
              className="inline-flex h-10 items-center rounded-lg bg-[#E0A526] px-5 text-sm font-semibold text-black"
            >
              View Orders
            </Link>
            <Link
              href="/menu"
              className="inline-flex h-10 items-center rounded-lg border border-border px-5 text-sm font-semibold"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/50 pb-6">
        <div>
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Your Cart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {cart.count} items ready to order.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void refresh()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-secondary"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {cart.items.length > 0 && (
            <button
              onClick={handleClear}
              className="flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {unavailableItems.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {unavailableItems.length}{" "}
          item(s) are unavailable.
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="mt-12 text-center">
          <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground/30" />
          <h2 className="mt-6 font-heading text-2xl font-bold">
            Your cart is empty
          </h2>
          <Link
            href="/menu"
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-[#E0A526] px-5 text-sm font-semibold text-black"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                busy={busyId === item.productId}
                onIncrease={() => handleUpdateQty(item, item.quantity + 1)}
                onDecrease={() => handleUpdateQty(item, item.quantity - 1)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </ul>

          <OrderSummary
            subtotal={subtotal}
            serviceCharge={serviceCharge}
            deliveryFee={deliveryFee}
            total={total}
            itemCount={cart.count}
            disabled={availableItems.length === 0}
            onCheckout={() => setCheckoutOpen(true)}
          />
        </div>
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => !placing && setCheckoutOpen(false)}
        user={user}
        addresses={addresses}
        addressesLoading={addressesLoading}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onAddAddress={addAddress}
        onRefreshAddresses={refreshAddresses}
        orderTotal={total}
        placing={placing}
        placingError={placingError}
        onCashConfirm={() => createOrder("Cash")}
        onCardConfirm={() => createOrder("Card")}
      />
    </div>
  );
}
