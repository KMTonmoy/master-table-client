"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  X,
  Sparkles,
  UtensilsCrossed,
  Drumstick,
  Beef,
  Fish,
  Salad,
  EggFried,
  Popcorn,
  CakeSlice,
  CupSoda,
  Martini,
  Leaf,
  Flame,
  Circle,
  Soup,
  ChefHat,
  ArrowUpDown,
  Sparkle,
} from "lucide-react";
import ProductCard, {
  type Dish,
  type DishCategory,
} from "@/components/Common/Productcard";
import ProductCardSkeleton from "@/components/Skeleton/ProductCardSkeleton";
import { cn } from "@/lib/utils";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

const ITEMS_PER_PAGE = 12;

type CategoryValue = "all" | DishCategory;

const CATEGORIES: {
  label: string;
  value: CategoryValue;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "All", value: "all", Icon: Sparkles },
  { label: "Food", value: "food", Icon: UtensilsCrossed },
  { label: "Chicken", value: "chicken", Icon: Drumstick },
  { label: "Beef", value: "beef", Icon: Beef },
  { label: "Seafood", value: "seafood", Icon: Fish },
  { label: "Vegan", value: "vegan", Icon: Salad },
  { label: "Breakfast", value: "breakfast", Icon: EggFried },
  { label: "Snacks", value: "snacks", Icon: Popcorn },
  { label: "Dessert", value: "dessert", Icon: CakeSlice },
  { label: "Soft drink", value: "soft-drink", Icon: CupSoda },
  { label: "Hard drink", value: "hard-drink", Icon: Martini },
];

const DIETS = [
  { label: "All", value: "all", Icon: Circle },
  { label: "Veg", value: "veg", Icon: Leaf },
  { label: "Vegan", value: "vegan", Icon: Salad },
  { label: "Non-veg", value: "non-veg", Icon: Flame },
] as const;

const SORTS = [
  { label: "Recommended", value: "recommended" },
  { label: "Most popular", value: "popular" },
  { label: "Top rated", value: "rating" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
] as const;

type DietValue = (typeof DIETS)[number]["value"];
type SortValue = (typeof SORTS)[number]["value"];

type DishExtras = {
  price?: number;
  rating?: number;
  sold?: number;
  ingredients?: string[];
};
type MenuDish = Dish & DishExtras;

type SearchState = {
  key: string;
  results: MenuDish[];
  error: boolean;
  fuzzy: boolean;
};

const CATEGORY_VALUES: string[] = CATEGORIES.map((c) => c.value);
const DIET_VALUES: string[] = DIETS.map((d) => d.value);
const SORT_VALUES: string[] = SORTS.map((s) => s.value);

const EASE = [0.22, 1, 0.36, 1] as const;

function parseCategory(value: string | null): CategoryValue {
  return value && CATEGORY_VALUES.includes(value)
    ? (value as CategoryValue)
    : "all";
}

function parseDiet(value: string | null): DietValue {
  return value && DIET_VALUES.includes(value) ? (value as DietValue) : "all";
}

function parseSort(value: string | null): SortValue {
  return value && SORT_VALUES.includes(value)
    ? (value as SortValue)
    : "recommended";
}

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function buildQuery(filters: {
  q?: string;
  category: CategoryValue;
  diet: DietValue;
  sort: SortValue;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.category !== "all") sp.set("category", filters.category);
  if (filters.diet !== "all") sp.set("diet", filters.diet);
  if (filters.sort !== "recommended") sp.set("sort", filters.sort);
  if (filters.page && filters.page > 1) sp.set("page", String(filters.page));
  return sp.toString();
}

function pageRange(current: number, total: number): (number | "ellipsis")[] {
  const delta = 1;
  const range: (number | "ellipsis")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("ellipsis");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("ellipsis");
  if (total > 1) range.push(total);

  return range;
}

const SHELL_CLASSES = "relative mx-auto w-full max-w-[1200px] px-4 sm:px-5";

const CARD_LIST_CLASSES =
  "relative grid w-full grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5";

const ON_GOLD = "text-[#3B2416]";

const Ornament = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}
  >
    <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#E0A526]/70 sm:w-20" />
    <span className="h-2 w-2 rotate-45 rounded-[3px] bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_0_0_4px_var(--background),0_0_16px_rgba(224,165,38,0.4)] sm:h-2.5 sm:w-2.5" />
    <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#E0A526]/70 sm:w-20" />
  </div>
);

const headerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const headerItem = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

type SortDropdownProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
  reduceMotion: boolean | null;
};

const SortDropdown = ({ value, onChange, reduceMotion }: SortDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const currentIndex = SORTS.findIndex((s) => s.value === value);
  const current = SORTS[currentIndex] ?? SORTS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-sort-index="${highlighted}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const openWithHighlight = () => {
    setHighlighted(currentIndex);
    setOpen(true);
  };

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      setHighlighted(next ? currentIndex : -1);
      return next;
    });
  };

  const commit = (v: SortValue) => {
    onChange(v);
    setOpen(false);
    setHighlighted(-1);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openWithHighlight();
        return;
      }
      setHighlighted((h) => {
        if (e.key === "ArrowDown") return (h + 1) % SORTS.length;
        return h <= 0 ? SORTS.length - 1 : h - 1;
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && highlighted >= 0) {
        commit(SORTS[highlighted].value);
      } else {
        toggle();
      }
    } else if (e.key === "Home") {
      setHighlighted(0);
    } else if (e.key === "End") {
      setHighlighted(SORTS.length - 1);
    }
  };

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32 };

  return (
    <div ref={rootRef} className="relative z-40 w-full sm:w-64">
      <motion.button
        type="button"
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2, ease: EASE }}
        className={cn(
          "group/dd relative inline-flex h-11 w-full items-center gap-2 overflow-hidden rounded-full border px-4 text-left text-sm font-medium transition-colors sm:h-[46px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open
            ? "border-[#E0A526]/70 bg-background shadow-[0_0_0_3px_rgba(224,165,38,0.15)]"
            : "border-border bg-background/80 hover:border-[#E0A526]/50",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/20 to-transparent transition-transform duration-1000 ease-out group-hover/dd:translate-x-full"
        />
        <ArrowUpDown
          aria-hidden
          className="relative h-4 w-4 shrink-0 text-[#E0A526]"
        />
        <span className="relative min-w-0 flex-1 truncate text-foreground">
          {current.label}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="relative inline-flex"
        >
          <ChevronDown className="h-4 w-4 text-[#E0A526]" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scale: 0.97, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scale: 0.97, filter: "blur(6px)" }
            }
            transition={{ duration: 0.25, ease: EASE }}
            className="
              absolute left-0 right-0 top-[calc(100%+10px)] z-[9999] origin-top overflow-hidden rounded-2xl
              border border-[#E0A526]/25 bg-card/95 shadow-[0_24px_60px_-24px_rgba(74,46,32,0.5)]
              backdrop-blur-2xl backdrop-saturate-150
            "
            role="listbox"
            aria-label="Sort dishes"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E0A526]/15 blur-3xl"
            />

            <div className="relative px-3 pt-3 pb-2">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E0A526]">
                Sort by
              </span>
            </div>

            <ul
              ref={listRef}
              className="relative max-h-72 overflow-y-auto p-1.5"
            >
              {SORTS.map((s, i) => {
                const selected = s.value === value;
                const active = i === highlighted;
                return (
                  <li
                    key={s.value}
                    data-sort-index={i}
                    role="option"
                    aria-selected={selected}
                  >
                    <button
                      type="button"
                      onPointerEnter={() => setHighlighted(i)}
                      onClick={() => commit(s.value)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        "focus-visible:outline-none",
                        active
                          ? "bg-[#E0A526]/10 text-foreground"
                          : "text-muted-foreground hover:bg-[#E0A526]/5 hover:text-foreground",
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="sort-selected-bg"
                          transition={pillTransition}
                          className="absolute inset-0 -z-0 rounded-xl bg-gradient-to-r from-[#E0A526]/15 to-transparent ring-1 ring-inset ring-[#E0A526]/30"
                        />
                      )}
                      <span className="relative flex min-w-0 flex-1 items-center gap-2.5">
                        <span
                          className={cn(
                            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                            selected
                              ? "border-[#E0A526] bg-gradient-to-br from-[#E0A526] to-[#C78E1E]"
                              : "border-border",
                          )}
                        >
                          {selected && (
                            <Check
                              aria-hidden
                              className="h-2.5 w-2.5 text-[#3B2416]"
                              strokeWidth={3.5}
                            />
                          )}
                        </span>
                        <span className="truncate font-medium">{s.label}</span>
                      </span>
                      {selected && (
                        <span className="relative text-[10px] font-semibold uppercase tracking-wider text-[#E0A526]">
                          Active
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type PaginationProps = {
  current: number;
  totalPages: number;
  onChange: (page: number) => void;
  reduceMotion: boolean | null;
  scrollTargetRef?: React.RefObject<HTMLDivElement | null>;
};

const Pagination = ({
  current,
  totalPages,
  onChange,
  reduceMotion,
  scrollTargetRef,
}: PaginationProps) => {
  const pages = useMemo(
    () => pageRange(current, totalPages),
    [current, totalPages],
  );

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === current) return;
    onChange(page);
    if (scrollTargetRef?.current) {
      scrollTargetRef.current.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    } else if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <motion.nav
      aria-label="Pagination"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative mt-10 flex flex-col items-center gap-3 sm:mt-14 sm:gap-4"
    >
      <div
        aria-hidden
        className="flex w-full items-center justify-center gap-3 opacity-60"
      >
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#E0A526]/60 sm:w-24" />
        <span className="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-gradient-to-br from-[#E0A526] to-[#C78E1E]" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#E0A526]/60 sm:w-24" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <motion.button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          whileHover={
            reduceMotion || current === 1 ? undefined : { scale: 1.05, y: -1 }
          }
          whileTap={reduceMotion || current === 1 ? undefined : { scale: 0.95 }}
          transition={{ duration: 0.2, ease: EASE }}
          aria-label="Previous page"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors sm:h-10 sm:w-10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            current === 1
              ? "cursor-not-allowed border-border bg-background/60 text-muted-foreground/40"
              : "border-border bg-background/80 text-foreground hover:border-[#E0A526]/50 hover:bg-[#E0A526]/5 hover:text-[#E0A526]",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground sm:h-10 sm:w-10"
            >
              …
            </span>
          ) : (
            <motion.button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              disabled={p === current}
              whileHover={reduceMotion ? undefined : { scale: 1.05, y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE }}
              aria-label={`Page ${p}`}
              aria-current={p === current ? "page" : undefined}
              className={cn(
                "relative inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm font-semibold transition-colors sm:h-10 sm:min-w-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                p === current
                  ? "border-transparent bg-gradient-to-br from-[#E0A526] to-[#C78E1E] text-[#3B2416] shadow-[0_10px_24px_-10px_rgba(224,165,38,0.7)]"
                  : "border-border bg-background/80 text-foreground hover:border-[#E0A526]/50 hover:bg-[#E0A526]/5 hover:text-[#E0A526]",
              )}
            >
              {p === current && (
                <motion.span
                  layoutId="menu-pagination-pill"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 38 }
                  }
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_10px_24px_-10px_rgba(224,165,38,0.7)]"
                />
              )}
              <span className="relative">{p}</span>
            </motion.button>
          ),
        )}

        <motion.button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current === totalPages}
          whileHover={
            reduceMotion || current === totalPages
              ? undefined
              : { scale: 1.05, y: -1 }
          }
          whileTap={
            reduceMotion || current === totalPages ? undefined : { scale: 0.95 }
          }
          transition={{ duration: 0.2, ease: EASE }}
          aria-label="Next page"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors sm:h-10 sm:w-10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            current === totalPages
              ? "cursor-not-allowed border-border bg-background/60 text-muted-foreground/40"
              : "border-border bg-background/80 text-foreground hover:border-[#E0A526]/50 hover:bg-[#E0A526]/5 hover:text-[#E0A526]",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      <p className="text-xs text-muted-foreground sm:text-sm">
        Page{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {current}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {totalPages}
        </span>
      </p>
    </motion.nav>
  );
};

const MenuContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const gridTopRef = useRef<HTMLDivElement>(null);

  const [dishes, setDishes] = useState<MenuDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [searchState, setSearchState] = useState<SearchState | null>(null);

  const keyword = (searchParams.get("q") ?? "").trim();
  const hasKeyword = keyword.length > 0;

  const category = parseCategory(searchParams.get("category"));
  const diet = parseDiet(searchParams.get("diet"));
  const sort = parseSort(searchParams.get("sort"));
  const page = parsePage(searchParams.get("page"));

  useEffect(() => {
    let cancelled = false;

    axios
      .get<MenuDish[]>(`${API_URL}/products`)
      .then((res) => {
        if (!cancelled) setDishes(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("[MenuPage] Fetch failed:", err?.message);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    if (!keyword) return;
    let cancelled = false;

    axios
      .get<{
        query: string;
        count: number;
        fuzzy?: boolean;
        results: MenuDish[];
      }>(`${API_URL}/api/products/keyword`, {
        params: { q: keyword, limit: 60 },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setSearchState({
          key: keyword,
          results: Array.isArray(data?.results) ? data.results : [],
          error: false,
          fuzzy: Boolean(data?.fuzzy),
        });
      })
      .catch((err) => {
        console.error("[MenuPage] Search failed:", err);
        if (cancelled) return;
        setSearchState({
          key: keyword,
          results: [],
          error: true,
          fuzzy: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, attempt]);

  const activeSearch =
    hasKeyword && searchState?.key === keyword ? searchState : null;
  const effectiveSearchResults = activeSearch?.results ?? null;
  const effectiveSearchLoading = hasKeyword && !activeSearch;
  const effectiveSearchError = Boolean(activeSearch?.error);
  const effectiveDidYouMean = activeSearch?.fuzzy ? keyword : null;

  const localMatched = useMemo(
    () => dishes.filter((dish) => diet === "all" || dish.diet === diet),
    [dishes, diet],
  );

  const matched = useMemo(() => {
    if (!hasKeyword) return localMatched;
    if (!effectiveSearchResults) return [];
    return diet === "all"
      ? effectiveSearchResults
      : effectiveSearchResults.filter((d) => d.diet === diet);
  }, [hasKeyword, effectiveSearchResults, localMatched, diet]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: matched.length };
    matched.forEach((d) => {
      const key = String(d.category);
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [matched]);

  const visible = useMemo(() => {
    const list =
      category === "all"
        ? [...matched]
        : matched.filter((d) => d.category === category);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        list.sort((b, a) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "popular":
        list.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }
    return list;
  }, [matched, category, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = useMemo(
    () => visible.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [visible, startIndex],
  );

  const hasActiveFilters =
    hasKeyword ||
    category !== "all" ||
    diet !== "all" ||
    sort !== "recommended";

  const updateFilters = (
    next: Partial<{
      category: CategoryValue;
      diet: DietValue;
      sort: SortValue;
      page: number;
    }>,
    { resetPage = true }: { resetPage?: boolean } = {},
  ) => {
    const nextPage = resetPage ? 1 : (next.page ?? safePage);
    const qs = buildQuery({
      q: keyword,
      category,
      diet,
      sort,
      ...next,
      page: nextPage,
    });
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };

  const changePage = (newPage: number) => {
    const qs = buildQuery({
      q: keyword,
      category,
      diet,
      sort,
      page: newPage,
    });
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };

  const clearKeyword = () => {
    const qs = buildQuery({ category, diet, sort, page: 1 });
    router.push(qs ? `/menu?${qs}` : "/menu", { scroll: false });
  };

  const resetAll = () => {
    router.push("/menu", { scroll: false });
  };

  const retry = () => {
    setError(false);
    setSearchState(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 38 };

  const isLoading = hasKeyword ? effectiveSearchLoading : loading;
  const isError = hasKeyword ? effectiveSearchError : error;

  return (
    <section className="section relative w-full overflow-x-clip pt-6 sm:pt-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-56 w-[26rem] max-w-full -translate-x-1/2 rounded-full bg-[#E0A526]/20 blur-[80px] sm:h-80 sm:w-[40rem] sm:blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-52 w-[24rem] max-w-full -translate-x-1/2 rounded-full bg-[#C78E1E]/15 blur-[100px] sm:h-72 sm:w-[36rem] sm:blur-[120px]" />
        <div className="absolute left-1/4 top-1/3 hidden h-64 w-64 rounded-full bg-[#E0A526]/10 blur-[90px] sm:block" />
      </div>

      <div className={SHELL_CLASSES}>
        <motion.header
          variants={headerContainer}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div
            variants={headerItem}
            className="inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0A526] sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.25em]"
          >
            <ChefHat className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Master Table Menu
          </motion.div>

          <motion.h1
            variants={headerItem}
            className="mt-4 text-balance break-words font-heading text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl md:text-6xl"
          >
            {hasKeyword ? (
              <>
                Results for{" "}
                <span className="relative inline-block text-[#E0A526]">
                  &ldquo;{keyword}&rdquo;
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: EASE, delay: 0.5 }}
                    style={{ transformOrigin: "left" }}
                    className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E] sm:h-[3px]"
                  />
                </span>
              </>
            ) : (
              <>
                Explore every{" "}
                <span className="relative inline-block text-[#E0A526]">
                  dish
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: EASE, delay: 0.5 }}
                    style={{ transformOrigin: "left" }}
                    className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E] sm:h-[3px]"
                  />
                </span>
              </>
            )}
          </motion.h1>

          <motion.div variants={headerItem}>
            <Ornament className="mt-4 sm:mt-6" />
          </motion.div>

          <motion.p
            variants={headerItem}
            className="mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:mt-6 sm:text-lg"
          >
            {hasKeyword
              ? "Narrow it down with the filters below, or clear the search to see everything."
              : "From tandoor classics to modern plates — handpicked, freshly made, and delivered hot."}
          </motion.p>

          {hasKeyword && (
            <motion.button
              variants={headerItem}
              type="button"
              onClick={clearKeyword}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-4 inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-[#E0A526]/40 bg-card/80 pl-3.5 pr-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-[#E0A526] hover:bg-[#E0A526]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-6 sm:h-10 sm:pl-4 sm:pr-3 sm:text-sm"
            >
              <Search
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 text-[#E0A526] sm:h-4 sm:w-4"
              />
              <span className="truncate">{keyword}</span>
              <X
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4"
              />
              <span className="sr-only">Clear search</span>
            </motion.button>
          )}

          <AnimatePresence>
            {hasKeyword &&
              effectiveDidYouMean &&
              !isLoading &&
              visible.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/5 px-3 py-1 text-[11px] font-medium text-[#E0A526] sm:mt-4 sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-sm"
                >
                  <Sparkle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Showing closest matches for{" "}
                  <span className="font-semibold">
                    &ldquo;{effectiveDidYouMean}&rdquo;
                  </span>
                </motion.div>
              )}
          </AnimatePresence>
        </motion.header>

        <motion.div
          initial={
            reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="relative z-30 mx-auto mt-6 w-full max-w-5xl overflow-visible rounded-3xl border border-border bg-card/70 p-3 shadow-[0_20px_50px_-24px_rgba(74,46,32,0.35)] backdrop-blur-xl sm:mt-12 sm:rounded-[2rem] sm:p-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent sm:inset-x-8"
          />
          <motion.div
            aria-hidden
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E0A526]/15 blur-3xl sm:h-40 sm:w-40"
          />

          <div
            role="group"
            aria-label="Category"
            className="relative -m-2 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max gap-1.5 md:w-auto md:flex-wrap md:justify-center md:gap-2">
              {CATEGORIES.map((c) => {
                const active = category === c.value;
                const count = counts[c.value] ?? 0;
                const empty = !active && count === 0;
                const Icon = c.Icon;

                return (
                  <motion.button
                    key={c.value}
                    type="button"
                    disabled={empty}
                    aria-pressed={active}
                    onClick={() => updateFilters({ category: c.value })}
                    whileHover={!empty && !active ? { y: -2 } : undefined}
                    whileTap={!empty ? { scale: 0.96 } : undefined}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={cn(
                      "relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:h-11 sm:gap-2 sm:px-4 sm:text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? cn("border-transparent font-semibold", ON_GOLD)
                        : "border-border bg-background/80 text-foreground hover:border-[#E0A526]/50 hover:bg-background",
                      empty &&
                        "cursor-not-allowed opacity-45 hover:border-border hover:bg-background/80",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="menu-category-pill"
                        transition={pillTransition}
                        className="absolute -inset-px rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_10px_24px_-10px_rgba(224,165,38,0.7)]"
                      />
                    )}
                    <Icon
                      aria-hidden
                      className={cn(
                        "relative h-3.5 w-3.5 shrink-0 transition-colors sm:h-4 sm:w-4",
                        active ? "text-[#3B2416]" : "text-[#E0A526]",
                      )}
                    />
                    <span className="relative">{c.label}</span>
                    <span
                      className={cn(
                        "relative rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums sm:text-xs",
                        active
                          ? "bg-black/10"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="relative mt-3 flex flex-col items-stretch gap-3 border-t border-border/80 pt-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:pt-5">
            <div
              role="group"
              aria-label="Diet"
              className="flex w-full rounded-full border border-border bg-secondary/70 p-1 sm:w-auto"
            >
              {DIETS.map((d) => {
                const active = diet === d.value;
                const Icon = d.Icon;
                return (
                  <motion.button
                    key={d.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateFilters({ diet: d.value })}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className={cn(
                      "relative inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors sm:h-9 sm:flex-none sm:px-4 sm:text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="menu-diet-pill"
                        transition={pillTransition}
                        className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-[#E0A526]/30"
                      />
                    )}
                    <Icon
                      aria-hidden
                      className={cn(
                        "relative hidden h-3.5 w-3.5 sm:inline-block",
                        d.value === "veg" && "text-emerald-500",
                        d.value === "vegan" && "text-lime-500",
                        d.value === "non-veg" && "text-red-500",
                        d.value === "all" && "text-[#E0A526]",
                      )}
                    />
                    <span className="relative">{d.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <SortDropdown
              value={sort}
              onChange={(v) => updateFilters({ sort: v })}
              reduceMotion={reduceMotion}
            />
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="relative mt-6 flex items-center gap-3 sm:mt-12 sm:gap-4"
        >
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E0A526]/40"
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <p
              aria-live="polite"
              className="text-center text-xs text-muted-foreground sm:text-sm"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#E0A526]" />
                  {hasKeyword ? "Searching dishes…" : "Loading dishes…"}
                </span>
              ) : isError ? (
                "Menu unavailable"
              ) : visible.length === 0 ? (
                hasKeyword ? (
                  <>
                    No match for{" "}
                    <span className="font-semibold text-foreground">
                      &ldquo;{keyword}&rdquo;
                    </span>
                  </>
                ) : (
                  "No dishes found"
                )
              ) : (
                <>
                  <span className="font-semibold tabular-nums text-foreground">
                    {visible.length}
                  </span>{" "}
                  {visible.length === 1 ? "dish" : "dishes"}
                  {hasKeyword && (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-semibold text-foreground">
                        &ldquo;{keyword}&rdquo;
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
            {hasActiveFilters && !isLoading && (
              <motion.button
                type="button"
                onClick={resetAll}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-[#E0A526]/50 hover:text-[#E0A526] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                Reset
              </motion.button>
            )}
          </div>
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E0A526]/40"
          />
        </motion.div>

        {isLoading && (
          <div className={cn("relative mt-6 sm:mt-8", CARD_LIST_CLASSES)}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative mx-auto mt-6 flex max-w-xl flex-col items-center overflow-hidden rounded-3xl border border-border bg-card/70 px-5 py-10 text-center backdrop-blur-xl sm:mt-8 sm:rounded-[2rem] sm:px-6 sm:py-14"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E0A526]/20 blur-3xl"
            />
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526] shadow-[0_0_30px_rgba(224,165,38,0.3)] sm:h-16 sm:w-16">
                <Soup className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-semibold text-foreground sm:mt-5 sm:text-2xl">
                {hasKeyword
                  ? "Couldn't search the menu"
                  : "Couldn't load the menu"}
              </h2>
              <p className="mt-2 max-w-sm text-xs text-muted-foreground sm:text-sm">
                Check your connection and try again.
              </p>
              <motion.button
                type="button"
                onClick={retry}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={cn(
                  "mt-5 inline-flex h-10 items-center rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-xs font-semibold shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)] transition-shadow hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-6 sm:h-11 sm:px-6 sm:text-sm",
                  ON_GOLD,
                )}
              >
                Try again
              </motion.button>
            </div>
          </motion.div>
        )}

        {!isLoading && !isError && visible.length === 0 && (
          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative mx-auto mt-6 flex max-w-xl flex-col items-center overflow-hidden rounded-3xl border border-dashed border-border bg-card/50 px-5 py-10 text-center sm:mt-8 sm:rounded-[2rem] sm:px-6 sm:py-14"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E0A526]/15 blur-3xl"
            />
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526] shadow-[0_0_30px_rgba(224,165,38,0.3)] sm:h-16 sm:w-16">
                <UtensilsCrossed className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <h2 className="mt-4 break-words font-heading text-xl font-semibold text-foreground sm:mt-5 sm:text-2xl">
                {hasKeyword ? (
                  <>
                    Nothing found for{" "}
                    <span className="text-[#E0A526]">
                      &ldquo;{keyword}&rdquo;
                    </span>
                  </>
                ) : (
                  "Nothing matches"
                )}
              </h2>
              <p className="mt-2 max-w-sm text-xs text-muted-foreground sm:text-sm">
                {hasKeyword
                  ? "We couldn't find anything close. Try another word, or browse the full menu."
                  : "Try a different word, or loosen the filters to see more dishes."}
              </p>
              <motion.button
                type="button"
                onClick={resetAll}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={cn(
                  "mt-5 inline-flex h-10 items-center rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-xs font-semibold shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)] transition-shadow hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-6 sm:h-11 sm:px-6 sm:text-sm",
                  ON_GOLD,
                )}
              >
                {hasKeyword ? "Show full menu" : "Clear filters"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {!isLoading && !isError && visible.length > 0 && (
          <>
            <div
              ref={gridTopRef}
              className={cn(
                "relative mt-6 scroll-mt-24 sm:mt-8",
                CARD_LIST_CLASSES,
              )}
            >
              <AnimatePresence mode="popLayout">
                {pageItems.map((dish, index) => (
                  <motion.div
                    key={dish._id}
                    layout={!reduceMotion}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 30,
                            scale: 0.96,
                            filter: "blur(6px)",
                          }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: -16,
                            scale: 0.96,
                            filter: "blur(4px)",
                          }
                    }
                    transition={{
                      duration: reduceMotion ? 0 : 0.55,
                      delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.3),
                      ease: EASE,
                    }}
                    className="min-w-0"
                  >
                    <ProductCard dish={dish} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Pagination
              current={safePage}
              totalPages={totalPages}
              onChange={changePage}
              reduceMotion={reduceMotion}
              scrollTargetRef={gridTopRef}
            />
          </>
        )}
      </div>
    </section>
  );
};

const MenuFallback = () => (
  <section className="section relative w-full overflow-x-clip pt-6 sm:pt-0">
    <div className={SHELL_CLASSES}>
      <div className="mx-auto h-10 w-full max-w-sm animate-pulse rounded-2xl bg-secondary sm:h-14 sm:max-w-md" />
      <div className="mx-auto mt-4 h-4 w-full max-w-md animate-pulse rounded-lg bg-secondary sm:mt-6 sm:h-5 sm:max-w-lg" />
      <div className="mx-auto mt-6 h-28 w-full max-w-5xl animate-pulse rounded-3xl bg-secondary/70 sm:mt-12 sm:h-36 sm:rounded-[2rem]" />
      <div className={cn("mt-6 sm:mt-12", CARD_LIST_CLASSES)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

const MenuPage = () => (
  <Suspense fallback={<MenuFallback />}>
    <MenuContent />
  </Suspense>
);

export default MenuPage;
