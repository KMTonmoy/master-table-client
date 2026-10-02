"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  CornerDownLeft,
  History,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingCart,
  Sun,
  Trash2,
  UserCog,
  UserPlus,
  X,
  CalendarCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import AuthModal from "./auth-modal";
import { useCart } from "@/components/providers/cart-provider";
import type { AuthMode, AuthUser } from "@/types/auth.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Reservations", href: "/reservations" },
  { label: "Contact", href: "/contact" },
];

const HISTORY_KEY = "mastertable:search-history";
const HISTORY_EVENT = "mastertable:search-history-change";
const HISTORY_LIMIT = 10;
const EMPTY_HISTORY: string[] = [];

const Z = {
  drawerBackdrop: "z-[9998]",
  drawer: "z-[9999]",
  header: "z-[10000]",
  searchDropdown: "z-[10050]",
  userDropdown: "z-[10050]",
  authModal: "z-[10100]",
} as const;

function subscribeToHistory(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(HISTORY_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(HISTORY_EVENT, callback);
  };
}

function getHistorySnapshot() {
  try {
    return window.localStorage.getItem(HISTORY_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerHistorySnapshot() {
  return "";
}

function parseHistory(raw: string): string[] {
  if (!raw) return EMPTY_HISTORY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_HISTORY;
    return parsed
      .filter((item): item is string => typeof item === "string")
      .slice(0, HISTORY_LIMIT);
  } catch {
    return EMPTY_HISTORY;
  }
}

function writeHistory(list: string[]) {
  try {
    if (list.length === 0) {
      window.localStorage.removeItem(HISTORY_KEY);
    } else {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    }
    window.dispatchEvent(new Event(HISTORY_EVENT));
  } catch {}
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

const USER_MENU_ITEMS = [
  { label: "My profile", href: "/account/profile", icon: UserCog },
  { label: "My orders", href: "/account/orders", icon: Package },
  {
    label: "My reservations",
    href: "/account/reservations",
    icon: CalendarCheck,
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { setTheme, resolvedTheme } = useTheme();
  const { cart } = useCart();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerPathname, setDrawerPathname] = useState(pathname);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [cartPulse, setCartPulse] = useState(0);
  const [isPending, startTransition] = useTransition();

  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const prevCartRef = useRef(0);

  const rawHistory = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const history = useMemo(() => parseHistory(rawHistory), [rawHistory]);

  const cartCount = cart.count;
  const cartBadge = formatCartCount(cartCount);

  if (pathname !== drawerPathname) {
    setDrawerPathname(pathname);
    setOpen(false);
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
          `${API_URL}/api/auth/me`,
          { withCredentials: true },
        );
        if (cancelled) return;
        setUser(data?.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (cartCount > prevCartRef.current) {
      setCartPulse((p) => p + 1);
    }
    prevCartRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setHeaderHeight(Math.round(el.getBoundingClientRect().height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shouldLock = open || authOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, authOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (authOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [authOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [dropdownOpen]);

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

  useEffect(() => {
    if (!mobileUserMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(e.target as Node)
      ) {
        setMobileUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileUserMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileUserMenuOpen]);

  useEffect(() => {
    if (activeIndex < 0) return;
    formRef.current
      ?.querySelector(`[data-history-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isDark = resolvedTheme === "dark";
  const hasQuery = query.trim().length > 0;
  const isAdmin = user?.role === "admin";

  const visibleHistory = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return history;
    return history.filter((item) => item.toLowerCase().includes(needle));
  }, [history, query]);

  const showEmptyHint = !hasQuery && history.length === 0;
  const showDropdown =
    dropdownOpen && !isPending && (visibleHistory.length > 0 || showEmptyHint);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setActiveIndex(-1);
  };

  const saveSearch = (keyword: string) => {
    const lower = keyword.toLowerCase();
    const next = [
      keyword,
      ...history.filter((item) => item.toLowerCase() !== lower),
    ].slice(0, HISTORY_LIMIT);
    writeHistory(next);
  };

  const removeSearch = (keyword: string) => {
    writeHistory(history.filter((item) => item !== keyword));
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    writeHistory([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const runSearch = (raw: string) => {
    const keyword = raw.trim();
    if (!keyword) return;
    saveSearch(keyword);
    closeDropdown();
    setOpen(false);
    inputRef.current?.blur();
    startTransition(() => {
      router.push(`/menu/${encodeURIComponent(keyword)}`);
    });
  };

  const pickHistoryItem = (keyword: string) => {
    setQuery(keyword);
    runSearch(keyword);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const picked = showDropdown ? visibleHistory[activeIndex] : undefined;
    if (picked) {
      pickHistoryItem(picked);
      return;
    }
    runSearch(query);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (showDropdown) {
        closeDropdown();
      } else if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!showDropdown) {
        setDropdownOpen(true);
        return;
      }
      const count = visibleHistory.length;
      if (count === 0) return;
      e.preventDefault();
      setActiveIndex((current) => {
        if (e.key === "ArrowDown") return (current + 1) % count;
        return current <= 0 ? count - 1 : current - 1;
      });
    }
  };

  const onFormBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) closeDropdown();
  };

  const clearQuery = () => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {}
    setUser(null);
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
    setOpen(false);
    router.replace("/");
    router.refresh();
  };

  const goToDashboard = () => {
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
    setOpen(false);
    router.push(isAdmin ? "/dashboard" : "/account/orders");
  };

  const cartLabel = cartCount
    ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
    : "Cart";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-shadow",
          Z.header,
          scrolled && "shadow-[0_8px_24px_-12px_rgba(74,46,32,0.15)]",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-6 sm:px-5">
          <Link
            href="/"
            aria-label="Master Table home"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:scale-[1.05] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/cart"
              aria-label={cartLabel}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:scale-[1.05] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <motion.span
                key={cartPulse}
                animate={
                  reduce
                    ? undefined
                    : {
                        scale: [1, 1.18, 1],
                        rotate: [0, -8, 8, 0],
                      }
                }
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="inline-flex"
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.span>

              <AnimatePresence>
                {cartBadge && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 520,
                      damping: 24,
                    }}
                    aria-hidden
                    className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-[#2B1B10] shadow-[0_0_0_2px_var(--background)]"
                  >
                    {cartBadge}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {!authChecked ? (
              <>
                <div className="hidden h-9 w-24 animate-pulse rounded-full bg-secondary lg:block" />
                <div className="h-9 w-16 animate-pulse rounded-full bg-secondary lg:hidden" />
              </>
            ) : user ? (
              <>
                <div ref={userMenuRef} className="relative hidden lg:block">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className={cn(
                      "group flex h-9 items-center gap-2 rounded-full border border-border bg-background/60 pl-1 pr-3 transition-all duration-300",
                      "hover:border-primary/40 hover:bg-secondary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      userMenuOpen && "border-primary/60 bg-secondary",
                    )}
                  >
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-amber-400 text-[11px] font-bold text-[#2B1B10]">
                      {user.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.profileImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initialsOf(user.name)
                      )}
                      {isAdmin && (
                        <span
                          aria-hidden
                          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                        />
                      )}
                    </span>
                    <span className="max-w-[110px] truncate text-sm font-medium text-foreground">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
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
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        role="menu"
                        className={cn(
                          "absolute right-0 top-[calc(100%+10px)] w-72 origin-top-right overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_40px_-16px_rgba(74,46,32,0.35)]",
                          Z.userDropdown,
                        )}
                      >
                        <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-4 py-4">
                          <div
                            aria-hidden
                            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
                          />
                          <div className="relative flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-amber-400 text-sm font-bold text-[#2B1B10] shadow-md">
                              {user.profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={user.profileImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initialsOf(user.name)
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {user.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="relative mt-3 flex flex-wrap gap-1.5">
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
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
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
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                  "hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary",
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
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div ref={mobileUserMenuRef} className="relative lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={mobileUserMenuOpen}
                    aria-label="Open account menu"
                    className={cn(
                      "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-amber-400 text-[11px] font-bold text-[#2B1B10] transition-all duration-300",
                      "hover:scale-[1.05]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      mobileUserMenuOpen &&
                        "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
                    )}
                  >
                    {user.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profileImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initialsOf(user.name)
                    )}
                    {isAdmin && (
                      <span
                        aria-hidden
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {mobileUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        role="menu"
                        className={cn(
                          "absolute right-0 top-[calc(100%+10px)] w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_40px_-16px_rgba(74,46,32,0.35)]",
                          Z.userDropdown,
                        )}
                      >
                        <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-4 py-4">
                          <div
                            aria-hidden
                            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
                          />
                          <div className="relative flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-amber-400 text-sm font-bold text-[#2B1B10] shadow-md">
                              {user.profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={user.profileImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initialsOf(user.name)
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {user.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="relative mt-3 flex flex-wrap gap-1.5">
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
                          </div>
                        </div>

                        <div className="p-1.5">
                          <button
                            type="button"
                            onClick={goToDashboard}
                            role="menuitem"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
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
                                onClick={() => setMobileUserMenuOpen(false)}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                  "hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary",
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
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:bg-destructive/10"
                          >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
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
                  onClick={() => openAuth("login")}
                  aria-label="Sign in"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
                >
                  <LogIn className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  aria-label="Create account"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-300 hover:scale-[1.05] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </>
            )}

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

        <div className="border-t border-border/50 bg-secondary/30 py-2.5 sm:py-3.5">
          <div className="mx-auto flex max-w-[1200px] items-center justify-center px-4 sm:px-5">
            <form
              ref={formRef}
              role="search"
              onSubmit={onSubmit}
              onBlur={onFormBlur}
              className="group relative w-full max-w-3xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 blur-lg transition-opacity duration-500 group-focus-within:opacity-100 motion-reduce:transition-none"
              />

              <div
                className={cn(
                  "relative flex h-11 items-center gap-2.5 rounded-full border border-border bg-background/70 pl-4 pr-1.5 sm:h-12 sm:gap-3 sm:pl-5 sm:pr-2",
                  "transition-all duration-300 motion-reduce:transition-none",
                  "hover:border-primary/40",
                  "group-focus-within:border-primary/70 group-focus-within:bg-background group-focus-within:shadow-[0_8px_24px_-8px] group-focus-within:shadow-primary/40",
                )}
              >
                <Search
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary"
                />

                <input
                  ref={inputRef}
                  type="search"
                  name="q"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  onClick={() => setDropdownOpen(true)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search dishes, cuisines, ingredients"
                  aria-label="Search the menu"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="h-full min-w-0 flex-1 text-ellipsis bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/80 md:text-[17px] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />

                {isPending ? (
                  <span
                    role="status"
                    aria-label="Searching"
                    className="mr-2 inline-flex h-8 w-8 items-center justify-center sm:mr-2.5 sm:h-9 sm:w-9"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </span>
                ) : hasQuery ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="hidden items-center gap-1.5 pr-1 text-sm text-muted-foreground md:inline-flex">
                      Press
                      <kbd className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-secondary px-2 font-sans text-xs font-medium text-foreground/80">
                        Enter
                        <CornerDownLeft className="h-3.5 w-3.5" />
                      </kbd>
                    </span>
                    <button
                      type="button"
                      onClick={clearQuery}
                      aria-label="Clear search"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      type="submit"
                      aria-label="Search"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background motion-reduce:transition-none sm:h-9 sm:w-9"
                    >
                      <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </button>
                  </div>
                ) : (
                  <kbd
                    aria-hidden
                    className="mr-2.5 hidden h-6 min-w-6 items-center justify-center rounded-md border border-border bg-secondary px-2 font-sans text-xs font-medium text-muted-foreground transition-opacity group-focus-within:opacity-0 md:inline-flex"
                  >
                    /
                  </kbd>
                )}
              </div>

              <div
                aria-hidden={!showDropdown}
                onMouseDown={(e) => e.preventDefault()}
                className={cn(
                  "absolute inset-x-0 top-[calc(100%+10px)] flex max-h-[min(60vh,26rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background sm:rounded-3xl",
                  "shadow-[0_18px_40px_-16px_rgba(74,46,32,0.35)]",
                  "transition-all duration-200 motion-reduce:transition-none",
                  Z.searchDropdown,
                  showDropdown
                    ? "visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 opacity-0",
                )}
              >
                {showEmptyHint ? (
                  <p className="px-4 py-6 text-center text-base text-muted-foreground">
                    Your recent searches will show up here.
                  </p>
                ) : (
                  <>
                    <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-1 pt-3 sm:px-5 sm:pt-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        {hasQuery ? "Matching searches" : "Recent searches"}
                      </span>
                      <button
                        type="button"
                        onClick={clearHistory}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear all
                      </button>
                    </div>

                    <ul className="overflow-y-auto overscroll-contain p-2">
                      {visibleHistory.map((item, index) => (
                        <li
                          key={item}
                          data-history-index={index}
                          className={cn(
                            "group/row flex items-center rounded-xl transition-colors sm:rounded-2xl",
                            "hover:bg-secondary focus-within:bg-secondary",
                            index === activeIndex && "bg-secondary",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => pickHistoryItem(item)}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:rounded-2xl sm:px-4"
                          >
                            <History
                              aria-hidden
                              className="h-5 w-5 shrink-0 text-muted-foreground"
                            />
                            <span className="truncate">{item}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSearch(item)}
                            aria-label={`Remove ${item} from search history`}
                            className="mr-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:group-hover/row:opacity-100 md:group-focus-within/row:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </header>

      <div
        style={{ top: headerHeight || 136 }}
        className={cn(
          "fixed inset-x-0 bottom-0 flex flex-col gap-1 overflow-y-auto border-t border-border bg-background p-4 pb-8 transition-all duration-200 lg:hidden",
          Z.drawer,
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
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
          className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
      </div>

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
