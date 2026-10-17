"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/format";
import type { CartItem } from "@/types/cart.types";

export function CartItemRow({
  item,
  busy,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  busy: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="h-20 w-20 overflow-hidden rounded-xl bg-secondary">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            {item.emoji}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{money(item.price)}</p>
          </div>
          <button
            onClick={onRemove}
            disabled={busy}
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center rounded-lg border border-border bg-background">
            <button
              onClick={onDecrease}
              disabled={busy || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center hover:bg-secondary disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={onIncrease}
              disabled={busy}
              className="flex h-8 w-8 items-center justify-center hover:bg-secondary disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <p className="font-bold text-[#E0A526]">{money(item.lineTotal)}</p>
        </div>
      </div>
    </li>
  );
}
