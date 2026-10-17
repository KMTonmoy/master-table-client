"use client";

import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { money } from "@/lib/format";
import type { AuthUser } from "@/types/auth.types";

export function StripeForm({
  user,
  amount,
  onSuccess,
  onBack,
  submitting,
  setSubmitting,
  setError,
}: {
  user: AuthUser;
  amount: number;
  onSuccess: () => void | Promise<void>;
  onBack: () => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Card validation failed");
      setSubmitting(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: user?.name || "Guest",
            email: user?.email || "",
          },
        },
      },
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setSubmitting(false);
      return;
    }

    await onSuccess();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1A1512] p-3">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card"],
            terms: { card: "never" },
            fields: {
              billingDetails: {
                email: 'never',
                name: 'never',
                phone: 'never',
              },
            },
          }}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1 text-[11px] text-[#E0A526]">
          <ShieldCheck className="h-3 w-3" /> Encrypted
        </span>
        <span className="text-xs font-semibold text-white">
          Total: {money(amount)}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-white/10 text-xs text-white/70 hover:bg-white/5 disabled:opacity-40"
        >
          <ArrowLeft className="h-3 w-3 mr-1" /> Back
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe || !elements}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-[#E0A526] to-[#F4D03F] text-xs font-bold text-[#2B1B10] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" /> Processing…
            </>
          ) : (
            <>
              Pay {money(amount)} <ArrowRight className="h-3 w-3 ml-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}