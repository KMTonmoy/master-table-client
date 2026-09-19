"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Check, KeyRound, Monitor, Moon, Palette, Store, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, Button, Card, CardHeader, Field, PageHeader, Select, Toggle, inputClass } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

type Tab = "restaurant" | "notifications" | "appearance" | "security";

const TABS: { id: Tab; label: string; hint: string; icon: LucideIcon }[] = [
  { id: "restaurant", label: "Restaurant", hint: "Name, hours and contact", icon: Store },
  { id: "notifications", label: "Notifications", hint: "Alerts and emails", icon: Bell },
  { id: "appearance", label: "Appearance", hint: "Theme and display", icon: Palette },
  { id: "security", label: "Security", hint: "Password and sessions", icon: KeyRound },
];

const useSaved = () => {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(t);
  }, [saved]);
  return [saved, () => setSaved(true)] as const;
};

const SaveBar = ({ saved, onSave }: { saved: boolean; onSave: () => void }) => (
  <div className="flex items-center justify-end gap-3 border-t border-border/70 px-5 py-4 sm:px-6">
    <span aria-live="polite" className={cn("inline-flex items-center gap-1.5 text-sm text-emerald-600 transition-opacity dark:text-emerald-400", saved ? "opacity-100" : "opacity-0")}>
      <Check className="h-4 w-4" /> Changes saved
    </span>
    <Button variant="primary" onClick={onSave}>
      Save changes
    </Button>
  </div>
);

const Restaurant = () => {
  const [saved, save] = useSaved();
  return (
    <Card>
      <CardHeader title="Restaurant profile" subtitle="This information appears on your website and receipts." />
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Restaurant name">
          <input className={inputClass} defaultValue="Master Table" />
        </Field>
        <Field label="Tagline">
          <input className={inputClass} defaultValue="Family recipes, wood-fired since 1985." />
        </Field>
        <Field label="Contact email">
          <input type="email" className={inputClass} defaultValue="hello@mastertable.com" />
        </Field>
        <Field label="Phone">
          <input type="tel" className={inputClass} defaultValue="+880 1700 000000" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address">
            <input className={inputClass} defaultValue="12 Station Road, Pabna" />
          </Field>
        </div>
        <Field label="Opens at">
          <input type="time" className={inputClass} defaultValue="11:00" />
        </Field>
        <Field label="Closes at">
          <input type="time" className={inputClass} defaultValue="23:00" />
        </Field>
        <Field label="Currency">
          <Select defaultValue="USD">
            <option value="USD">US dollar ($)</option>
            <option value="BDT">Bangladeshi taka (৳)</option>
            <option value="EUR">Euro (€)</option>
          </Select>
        </Field>
        <Field label="Service charge" hint="Added to dine-in orders.">
          <input type="number" min={0} max={30} className={inputClass} defaultValue={5} />
        </Field>
      </div>
      <SaveBar saved={saved} onSave={save} />
    </Card>
  );
};

const Notifications = () => {
  const [saved, save] = useSaved();
  const [prefs, setPrefs] = useState({
    newOrder: true,
    lowStock: true,
    reviews: false,
    reservations: true,
    weekly: true,
    marketing: false,
  });
  const rows: { key: keyof typeof prefs; title: string; desc: string }[] = [
    { key: "newOrder", title: "New orders", desc: "Play a sound and show an alert when an order comes in." },
    { key: "lowStock", title: "Low stock", desc: "Tell me when a dish drops below 10 portions." },
    { key: "reservations", title: "Reservations", desc: "Remind me 30 minutes before a booking." },
    { key: "reviews", title: "New reviews", desc: "Let me know when a guest leaves a rating." },
    { key: "weekly", title: "Weekly summary email", desc: "Sales and top dishes every Monday morning." },
    { key: "marketing", title: "Product updates", desc: "News about new Master Table dashboard features." },
  ];
  return (
    <Card>
      <CardHeader title="Notifications" subtitle="Choose what you want to hear about." />
      <ul className="divide-y divide-border/60 px-5 sm:px-6">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-6 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">{r.title}</p>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
            <Toggle checked={prefs[r.key]} onChange={(v) => setPrefs((p) => ({ ...p, [r.key]: v }))} label={r.title} />
          </li>
        ))}
      </ul>
      <SaveBar saved={saved} onSave={save} />
    </Card>
  );
};

const Appearance = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const options = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;
  return (
    <Card>
      <CardHeader title="Appearance" subtitle="Pick how the dashboard looks on this device." />
      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        {options.map((o) => {
          const Icon = o.icon;
          const active = mounted && theme === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(o.id)}
              className={cn(
                "flex flex-col items-start gap-6 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
              )}
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", active ? "bg-primary text-[#2B1B10]" : "bg-foreground/5 text-muted-foreground")}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground">{o.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

const Security = () => {
  const [saved, save] = useSaved();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Change password" subtitle="Use at least 12 characters." />
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <Field label="Current password">
              <input type="password" className={inputClass} autoComplete="current-password" />
            </Field>
          </div>
          <Field label="New password">
            <input type="password" className={inputClass} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" className={inputClass} autoComplete="new-password" />
          </Field>
        </div>
        <SaveBar saved={saved} onSave={save} />
      </Card>

      <Card>
        <CardHeader title="Signed-in devices" subtitle="Sign out anywhere you do not recognise." />
        <ul className="divide-y divide-border/60 px-5 pb-2 pt-3 sm:px-6">
          {[
            { name: "Chrome on Windows", meta: "Pabna, Bangladesh · This device", current: true },
            { name: "Safari on iPhone", meta: "Dhaka, Bangladesh · 2 days ago", current: false },
          ].map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={d.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.meta}</p>
                </div>
              </div>
              {!d.current && (
                <Button size="sm" variant="danger">
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

const Settings = () => {
  const [tab, setTab] = useState<Tab>("restaurant");

  return (
    <>
      <PageHeader title="Settings" description="Manage your restaurant, alerts and account." />

      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="p-2 lg:sticky lg:top-24">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col" role="tablist" aria-label="Settings sections">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <li key={t.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      active ? "bg-primary/15 ring-1 ring-inset ring-primary/30" : "hover:bg-foreground/5",
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{t.label}</span>
                      <span className="hidden text-xs text-muted-foreground lg:block">{t.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div role="tabpanel" className="min-w-0">
          {tab === "restaurant" && <Restaurant />}
          {tab === "notifications" && <Notifications />}
          {tab === "appearance" && <Appearance />}
          {tab === "security" && <Security />}
        </div>
      </div>
    </>
  );
};

export default Settings;
