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
import {
  CornerDownLeft,
  History,
  Loader2,
  Menu,
  Moon,
  Search,
  Sun,
  Trash2,
  X,
} from "lucide-react";
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

const HISTORY_KEY = "mastertable:search-history";
const HISTORY_EVENT = "mastertable:search-history-change";
const HISTORY_LIMIT = 10;
const EMPTY_HISTORY: string[] = [];

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

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerPathname, setDrawerPathname] = useState(pathname);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isPending, startTransition] = useTransition();

  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const rawHistory = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerHistorySnapshot
  );
  const history = useMemo(() => parseHistory(rawHistory), [rawHistory]);

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
    if (activeIndex < 0) return;
    formRef.current
      ?.querySelector(`[data-history-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isDark = resolvedTheme === "dark";
  const hasQuery = query.trim().length > 0;

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

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-shadow",
          scrolled && "shadow-[0_8px_24px_-12px_rgba(74,46,32,0.15)]"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:gap-6 sm:px-5">
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:scale-[1.05] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:scale-[1.05] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9 lg:hidden"
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
                  "group-focus-within:border-primary/70 group-focus-within:bg-background group-focus-within:shadow-[0_8px_24px_-8px] group-focus-within:shadow-primary/40"
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
                  "absolute inset-x-0 top-[calc(100%+10px)] z-50 flex max-h-[min(60vh,26rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background sm:rounded-3xl",
                  "shadow-[0_18px_40px_-16px_rgba(74,46,32,0.35)]",
                  "transition-all duration-200 motion-reduce:transition-none",
                  showDropdown
                    ? "visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 opacity-0"
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
                            index === activeIndex && "bg-secondary"
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
          "fixed inset-x-0 bottom-0 z-40 flex flex-col gap-1 overflow-y-auto border-t border-border bg-background p-4 pb-8 transition-all duration-200 lg:hidden",
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