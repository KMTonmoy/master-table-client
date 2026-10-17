"use client";

import { useState } from "react";
import { ArrowRight, MapPin, Plus } from "lucide-react";
import type { Address, AddressInput } from "@/components/providers/cart-provider";
import { AddressForm } from "./AddressForm";

export function AddressStep({
  addresses,
  loading,
  selectedId,
  onSelect,
  onAdd,
  onRefresh,
  onNext,
  onClose,
}: {
  addresses: Address[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (data: AddressInput) => Promise<Address>;
  onRefresh: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const selected = addresses.find((a) => a.id === selectedId) ?? null;

  const handleSave = async (data: AddressInput) => {
    const created = await onAdd(data);
    onSelect(created.id);
    setShowForm(false);
  };

  return (
    <div className="text-white">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0A526]/20 text-[#E0A526]">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold">Address</h2>
          <p className="text-[10px] text-white/50">Step 1 of 2</p>
        </div>
      </div>

      {loading && addresses.length === 0 && <p className="text-xs text-white/50">Loading…</p>}

      {!loading && addresses.length === 0 && !showForm && (
        <button onClick={() => setShowForm(true)} className="w-full rounded-lg border border-dashed border-white/20 bg-white/5 px-3 py-3 text-left hover:border-[#E0A526]/50">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Plus className="h-3 w-3" /> Add address
          </span>
        </button>
      )}

      {addresses.length > 0 && (
        <ul className="space-y-1.5">
          {addresses.map((addr) => (
            <li key={addr.id}>
              <button
                onClick={() => onSelect(addr.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${
                  selectedId === addr.id ? "border-[#E0A526] bg-[#E0A526]/10" : "border-white/10 bg-[#1A1512] hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${selectedId === addr.id ? "border-[#E0A526] bg-[#E0A526]" : "border-white/30"}`}>
                    {selectedId === addr.id && <span className="h-1 w-1 rounded-full bg-black" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{addr.label || "Address"}</p>
                    <p className="truncate text-[10px] text-white/50">{[addr.line1, addr.city].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {addresses.length > 0 && !showForm && (
        <button onClick={() => setShowForm(true)} className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#E0A526] hover:opacity-80">
          <Plus className="h-3 w-3" /> Add another
        </button>
      )}

      {showForm && (
        <div className="mt-2 rounded-lg border border-white/10 bg-[#1A1512] p-3">
          <AddressForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button onClick={onClose} className="inline-flex h-10 w-20 items-center justify-center rounded-lg border border-white/10 text-xs font-medium text-white/70 hover:bg-white/5">
          Cancel
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#E0A526] to-[#F4D03F] text-xs font-bold text-[#2B1B10] disabled:opacity-50"
        >
          Continue <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}