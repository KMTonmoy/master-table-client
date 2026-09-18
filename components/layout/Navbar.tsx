"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import AuthModal from "./auth-modal";
import type { AuthMode } from "@/types/auth.types";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Reservations", href: "/reservations" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerPathname, setDrawerPathname] = useState(pathname);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  if (pathname !== drawerPathname) {
    setDrawerPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const shouldLock = open || authOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, authOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isDark = resolvedTheme === "dark";

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-shadow",
          scrolled && "shadow-[0_8px_24px_-12px_rgba(74,46,32,0.15)]"
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-5">
          <Link
            href="/"
            aria-label="Master Table home"
            className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20"
            />
            <span className="font-heading text-2xl font-bold leading-none tracking-tight text-foreground">
              Master Table
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors",
                        "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active && "text-foreground",
                        active &&
                          "after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:scale-[1.05] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => openAuth("login")}
              className="
                hidden h-9 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground
                transition-all duration-300 hover:bg-secondary
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                lg:inline-flex
              "
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => openAuth("register")}
              className="
                hidden h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground
                shadow-sm transition-all duration-300
                hover:scale-[1.03] hover:bg-primary/90 hover:shadow-md
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                lg:inline-flex
              "
            >
              Register
            </button>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:scale-[1.05] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "fixed inset-x-0 top-[72px] bottom-0 z-40 flex flex-col gap-1 border-t border-border bg-background p-4 transition-all duration-200 lg:hidden",
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          )}
          aria-hidden={!open}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground",
                  active && "ring-1 ring-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="
                inline-flex h-11 items-center justify-center rounded-full border border-white/60 bg-white/25 text-sm font-semibold text-foreground
                backdrop-blur-md transition-all duration-300
                hover:scale-[1.02] hover:bg-white/40
                dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20
              "
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="
                inline-flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground
                shadow-sm transition-all duration-300
                hover:scale-[1.02] hover:bg-primary/90
              "
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </>
  );
};

export default Navbar;