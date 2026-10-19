"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  UserCog,
  X,
  CalendarCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import AuthModal from "./auth-modal";
import { useCart } from "@/components/providers/cart-provider";
import { useAuth } from "@/context/AuthContext";
import type { AuthMode } from "@/types/auth.types";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Reservations", href: "/reservations" },
  { label: "Contact", href: "/contact" },
];

const USER_MENU_ITEMS = [
  { label: "My profile", href: "/account/profile", icon: UserCog },
  { label: "My orders", href: "/account/orders", icon: Package },
  {
    label: "My reservations",
    href: "/account/reservations",
    icon: CalendarCheck,
  },
];

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatCartCount = (n: number) => {
  if (n <= 0) return null;
  if (n > 9) return "9+";
  return String(n);
};

const Avatar = ({
  profileImage,
  name,
  size = "sm",
  isAdmin = false,
}: {
  profileImage?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  isAdmin?: boolean;
}) => {
  const sizeClasses = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  };
  const badgeSize = size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5";

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-amber-400 font-bold text-[#2B1B10]",
        sizeClasses[size],
      )}
    >
      {profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profileImage} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
      {isAdmin && (
        <span
          aria-hidden
          className={cn(
            "absolute -right-0.5 -top-0.5 rounded-full bg-emerald-500 ring-2 ring-background",
            badgeSize,
          )}
        />
      )}
    </span>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { cart } = useCart();
  const { user, isAdmin, logOut } = useAuth();

  const mounted = useIsMounted();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [lastPathname, setLastPathname] = useState(pathname);

  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.count;
  const cartBadge = formatCartCount(cartCount);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
    setUserMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open && !authOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, authOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isDark = resolvedTheme === "dark";

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setOpen(false);
    await logOut();
    router.replace("/");
  };

  const goToDashboard = () => {
    setUserMenuOpen(false);
    setOpen(false);
    router.push(isAdmin ? "/dashboard" : "/account/orders");
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-[10000] w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-shadow",
          scrolled && "shadow-[0_8px_24px_-12px_rgba(74,46,32,0.15)]",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-6 sm:px-5">
          <Link
            href="/"
            aria-label="Master Table home"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-lg"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20"
            />
            <span className="font-heading text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
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
                        active && "text-foreground",
                        active &&
                          "after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all hover:bg-secondary hover:text-foreground"
            >
              {!mounted ? (
                <span className="inline-block h-5 w-5" aria-hidden />
              ) : isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all hover:bg-secondary hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartBadge && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-[#2B1B10] shadow-[0_0_0_2px_var(--background)]">
                  {cartBadge}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={userMenuRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className={cn(
                    "group flex h-9 items-center gap-2 rounded-full border border-border bg-background/60 pl-1 pr-3 transition-all",
                    "hover:border-primary/40 hover:bg-secondary",
                    userMenuOpen && "border-primary/60 bg-secondary",
                  )}
                >
                  <Avatar
                    profileImage={user.profileImage}
                    name={user.name}
                    size="sm"
                    isAdmin={isAdmin}
                  />
                  <span className="max-w-[110px] truncate text-sm font-medium text-foreground">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      className="absolute right-0 top-[calc(100%+10px)] z-[10050] w-72 origin-top-right overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
                    >
                      <div className="border-b border-border/60 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            profileImage={user.profileImage}
                            name={user.name}
                            size="lg"
                            isAdmin={isAdmin}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {user.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              isAdmin
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-primary/15 text-primary",
                            )}
                          >
                            {isAdmin ? "Admin" : "Customer"}
                          </span>
                          {user.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                              Verified
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {user.provider}
                          </span>
                        </div>
                      </div>

                      <div className="p-1.5">
                        <button
                          type="button"
                          onClick={goToDashboard}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-secondary"
                        >
                          <LayoutDashboard className="h-4 w-4 shrink-0 text-primary" />
                          {isAdmin ? "Go to dashboard" : "Go to my portal"}
                        </button>
                      </div>

                      <div className="border-t border-border/60 p-1.5">
                        {USER_MENU_ITEMS.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                "hover:bg-secondary",
                                active
                                  ? "bg-secondary text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="border-t border-border/60 p-1.5">
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="hidden h-9 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground hover:bg-secondary lg:inline-flex"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="hidden h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 lg:inline-flex"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/60 px-3.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-secondary lg:hidden"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Login
                </button>
              </>
            )}

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border/70 bg-background p-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {user && (
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-3 py-3">
                  <Avatar
                    profileImage={user.profileImage}
                    name={user.name}
                    size="md"
                    isAdmin={isAdmin}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      isAdmin
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {isAdmin ? "Admin" : "Customer"}
                  </span>
                </div>
              )}

              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                      "bg-secondary text-foreground hover:bg-accent",
                      active && "ring-1 ring-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-base font-medium text-foreground hover:bg-accent"
              >
                <span className="inline-flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Cart
                </span>
                {cartBadge && (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-[#2B1B10]">
                    {cartBadge}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link
                    href={isAdmin ? "/dashboard" : "/account/orders"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-base font-medium text-foreground hover:bg-accent"
                  >
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    {isAdmin ? "Dashboard" : "My portal"}
                  </Link>
                  {USER_MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-base font-medium text-foreground hover:bg-accent"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-left text-base font-medium text-destructive hover:bg-destructive/20"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="rounded-xl bg-secondary px-4 py-3 text-left text-base font-medium text-foreground hover:bg-accent"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="rounded-xl bg-primary px-4 py-3 text-left text-base font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </>
  );
}
