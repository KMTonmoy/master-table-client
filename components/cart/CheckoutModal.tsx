"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { AuthUser } from "@/types/auth.types";
import type { Address, AddressInput } from "@/components/providers/cart-provider";
import { AddressStep } from "./AddressStep";
import { PaymentStep } from "./PaymentStep";

export function CheckoutModal({
  open,
  onClose,
  user,
  addresses,
  addressesLoading,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
  onRefreshAddresses,
  orderTotal,
  placing,
  placingError,
  onCashConfirm,
  onCardConfirm,
}: {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  addresses: Address[];
  addressesLoading: boolean;
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onAddAddress: (data: AddressInput) => Promise<Address>;
  onRefreshAddresses: () => void;
  orderTotal: number;
  placing: boolean;
  placingError: string | null;
  onCashConfirm: () => void;
  onCardConfirm: () => void;
}) {
  const [step, setStep] = useState<"address" | "payment">("address");

  useEffect(() => {
    if (!open) setStep("address");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !placing && onClose()} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#120D0A] shadow-[0_0_60px_-15px_rgba(224,165,38,0.15)]">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E0A526] to-transparent" />
        
        <button
          onClick={onClose}
          disabled={placing}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-5">
          {step === "address" ? (
            <AddressStep
              addresses={addresses}
              loading={addressesLoading}
              selectedId={selectedAddressId}
              onSelect={onSelectAddress}
              onAdd={onAddAddress}
              onRefresh={onRefreshAddresses}
              onNext={() => setStep("payment")}
              onClose={onClose}
            />
          ) : (
            <PaymentStep
              user={user}
              orderTotal={orderTotal}
              placing={placing}
              placingError={placingError}
              onCashConfirm={onCashConfirm}
              onCardConfirm={onCardConfirm}
              onBack={() => setStep("address")}
            />
          )}
        </div>
      </div>
    </div>
  );
}