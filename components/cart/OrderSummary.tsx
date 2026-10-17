"use client";

import { ArrowRight } from "lucide-react";
import { money } from "@/lib/format";

export function OrderSummary({
  subtotal,
  serviceCharge,
  deliveryFee,
  total,
  itemCount,
  disabled,
  onCheckout,
}: {
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  disabled: boolean;
  onCheckout: () => void;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-bold">Order Summary</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount})</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Service (5%)</span>
          <span>{money(serviceCharge)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery</span>
          <span>{deliveryFee === 0 ? "Free" : money(deliveryFee)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="text-[#E0A526]">{money(total)}</span>
        </div>
      </div>
      <button
        onClick={onCheckout}
        disabled={disabled}
        className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#E0A526] to-[#F4D03F] text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
      >
        Checkout <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </aside>
  );
}