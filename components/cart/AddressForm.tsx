"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { AddressInput } from "@/components/providers/cart-provider";

const EMPTY: AddressInput = { label: "", line1: "", line2: "", city: "", postalCode: "", country: "", phone: "", isDefault: false };

export function AddressForm({
  onSave,
  onCancel,
}: {
  onSave: (data: AddressInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof AddressInput, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.line1.trim() || !form.city.trim() || form.phone.trim().length < 5) {
      setError("Please fill in line 1, city, and phone.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Label (Home)" className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#E0A526]/60 focus:outline-none" />
        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone" className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#E0A526]/60 focus:outline-none" />
      </div>
      <input value={form.line1} onChange={(e) => update("line1", e.target.value)} placeholder="Address line 1" className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#E0A526]/60 focus:outline-none" />
      <div className="grid grid-cols-2 gap-2">
        <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City" className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#E0A526]/60 focus:outline-none" />
        <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="Postal code" className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#E0A526]/60 focus:outline-none" />
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#E0A526] text-xs font-semibold text-black disabled:opacity-60">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:bg-white/5">
          Cancel
        </button>
      </div>
    </form>
  );
}