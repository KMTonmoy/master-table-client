"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { money } from "@/lib/format";
import { StripeForm } from "./StripeForm";
import type { AuthUser } from "@/types/auth.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise)
    stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : Promise.resolve(null);
  return stripePromise;
};

export function PaymentStep({
  user,
  orderTotal,
  placing,
  placingError,
  onCashConfirm,
  onCardConfirm,
  onBack,
}: {
  user: AuthUser;
  orderTotal: number;
  placing: boolean;
  placingError: string | null;
  onCashConfirm: () => void;
  onCardConfirm: () => void;
  onBack: () => void;
}) {
  const [method, setMethod] = useState<"Cash" | "Card">("Card");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    if (method !== "Card" || !STRIPE_PK || clientSecret) return;
    let cancelled = false;

    (async () => {
      setPreparing(true);
      try {
        const { data } = await axios.post(
          `${API_URL}/api/payments/create-payment-intent`,
          { price: orderTotal },
        );
        if (!cancelled && data?.data?.clientSecret) {
          setClientSecret(data.data.clientSecret);
        }
      } catch {
      } finally {
        if (!cancelled) setPreparing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [method, clientSecret, orderTotal]);

  const stripeOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "night" as const,
              variables: {
                colorPrimary: "#E0A526",
                colorBackground: "#1A1512",
                colorText: "#ffffff",
                borderRadius: "10px",
              },
            },
          }
        : null,
    [clientSecret],
  );

  return (
    <div className="text-white">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0A526]/20 text-[#E0A526]">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold">Payment</h2>
          <p className="text-[10px] text-white/50">Step 2 of 2</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setMethod("Cash")}
          className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-all ${
            method === "Cash"
              ? "border-[#E0A526] bg-[#E0A526]/10"
              : "border-white/10 bg-[#1A1512]"
          }`}
        >
          <span className="text-xs font-semibold text-white">Cash</span>
          <span className="text-[10px] text-white/50">Pay on delivery</span>
        </button>
        <button
          onClick={() => setMethod("Card")}
          className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-all ${
            method === "Card"
              ? "border-[#E0A526] bg-[#E0A526]/10"
              : "border-white/10 bg-[#1A1512]"
          }`}
        >
          <span className="text-xs font-semibold text-white">Card</span>
          <span className="text-[10px] text-white/50">Secure via Stripe</span>
        </button>
      </div>

      {placingError && (
        <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {placingError}
        </div>
      )}

      {method === "Cash" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-[#1A1512] px-3 py-3 text-xs text-white/70">
            Please have{" "}
            <strong className="text-white">{money(orderTotal)}</strong> ready.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBack}
              disabled={placing}
              className="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-white/10 text-xs text-white/70 hover:bg-white/5"
            >
              <ArrowLeft className="h-3 w-3 mr-1" /> Back
            </button>
            <button
              onClick={onCashConfirm}
              disabled={placing}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-[#E0A526] to-[#F4D03F] text-xs font-bold text-[#2B1B10] disabled:opacity-50"
            >
              {placing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                `Place order • ${money(orderTotal)}`
              )}
            </button>
          </div>
        </div>
      ) : preparing ? (
        <div className="flex items-center justify-center py-6 text-xs text-white/50">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Preparing…
        </div>
      ) : clientSecret && stripeOptions ? (
        <Elements stripe={getStripe()} options={stripeOptions}>
          <StripeForm
            user={user}
            amount={orderTotal}
            onSuccess={onCardConfirm}
            onBack={onBack}
            submitting={placing}
            setSubmitting={() => {}}
            setError={() => {}}
          />
        </Elements>
      ) : null}
    </div>
  );
}
