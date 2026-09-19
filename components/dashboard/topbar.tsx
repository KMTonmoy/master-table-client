"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, ChevronRight, ExternalLink, Menu, Moon, Search, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/dashboard/ui";

const TITLES: Record<string, string> = {
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  categories: "Categories",
  analytics: "Analytics",
  reports: "Reports",
  settings: "Settings",
};

const NOTIFICATIONS = [
  { id: 1, title: "New order #MT-4821", body: "Table T-07 · $20.50", time: "2 min ago", unread: true },
  { id: 2, title: "Truffle Funghi is low on stock", body: "Only 8 portions left", time: "11 min ago", unread: true },
  { id: 3, title: "Weekly report is ready", body: "Sales summary for Sep 7–13", time: "Yesterday", unread: false },
];

type TopbarProps = {
  isScrolled: boolean;
  onOpenMenu: () => void;
};

const Topbar = ({ isScrolled, onOpenMenu }: TopbarProps) => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setNotifOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const segment = pathname.split("/")[2];
  const current = segment ? TITLES[segment] ?? segment : "Overview";
  const isDark = resolvedTheme === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-3 border-b border-border bg-background/75 px-4 backdrop-blur-2xl transition-shadow sm:px-6 lg:px-8",
        isScrolled && "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)]",
      )}
    >
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open sidebar"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
        <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="font-medium text-foreground">{current}</span>
      </nav>
      <span className="font-heading text-base font-semibold text-foreground sm:hidden">{current}</span>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <label className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search orders, dishes, guests"
            className="h-10 w-72 rounded-full border border-border bg-card/60 pl-10 pr-14 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25 lg:w-96"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Ctrl K
          </kbd>
        </label>

        <Link
          href="/"
          className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground xl:inline-flex"
        >
          View site <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          {mounted && isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="font-heading text-base font-semibold text-foreground">Notifications</p>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Mark all as read
                </button>
              </div>
              <ul>
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0">
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent")} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 rounded-full border border-border bg-card/60 p-1 sm:pr-4">
          <Avatar name="Admin User" size="sm" />
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-foreground">Admin</p>
            <p className="text-[11px] text-muted-foreground">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
