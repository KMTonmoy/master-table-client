"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import ProductCard, {
  type Dish,
  type DishCategory,
} from "@/components/Common/Productcard";
import ProductCardSkeleton from "@/components/Skeleton/ProductCardSkeleton";
import { cn } from "@/lib/utils";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type CategoryValue = "all" | DishCategory;

const CATEGORIES: { label: string; value: CategoryValue; emoji: string }[] = [
  { label: "All", value: "all", emoji: "✨" },
  { label: "Food", value: "food", emoji: "🍽️" },
  { label: "Chicken", value: "chicken", emoji: "🍗" },
  { label: "Beef", value: "beef", emoji: "🥩" },
  { label: "Seafood", value: "seafood", emoji: "🦐" },
  { label: "Vegan", value: "vegan", emoji: "🥗" },
  { label: "Breakfast", value: "breakfast", emoji: "🍳" },
  { label: "Snacks", value: "snacks", emoji: "🍿" },
  { label: "Dessert", value: "dessert", emoji: "🍰" },
  { label: "Soft drink", value: "soft-drink", emoji: "🥤" },
  { label: "Hard drink", value: "hard-drink", emoji: "🍸" },
];

const DIETS = [
  { label: "All", value: "all", dot: "" },
  { label: "Veg", value: "veg", dot: "bg-emerald-500" },
  { label: "Vegan", value: "vegan", dot: "bg-lime-500" },
  { label: "Non-veg", value: "non-veg", dot: "bg-red-500" },
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

const CATEGORY_VALUES: string[] = CATEGORIES.map((c) => c.value);
const DIET_VALUES: string[] = DIETS.map((d) => d.value);
const SORT_VALUES: string[] = SORTS.map((s) => s.value);

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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function buildHaystack(dish: MenuDish) {
  return [
    dish.name,
    dish.description,
    dish.cuisine,
    dish.category,
    dish.diet,
    ...(dish.tags ?? []),
    ...(dish.ingredients ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildQuery(filters: {
  category: CategoryValue;
  diet: DietValue;
  sort: SortValue;
}) {
  const sp = new URLSearchParams();
  if (filters.category !== "all") sp.set("category", filters.category);
  if (filters.diet !== "all") sp.set("diet", filters.diet);
  if (filters.sort !== "recommended") sp.set("sort", filters.sort);
  return sp.toString();
}

const SHELL_CLASSES = "relative mx-auto w-full max-w-[1200px] px-5";

const CARD_LIST_CLASSES =
  "relative flex flex-wrap justify-center gap-4 sm:gap-5";

const CARD_WIDTH_CLASSES =
  "w-[calc(50%_-_0.5rem)] sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.84rem)] lg:w-[calc(25%_-_0.94rem)]";

const ON_GOLD = "text-[#3B2416]";

const Ornament = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn("flex items-center justify-center gap-3", className)}
  >
    <span className="h-px w-14 bg-gradient-to-r from-transparent to-primary/70 sm:w-20" />
    <span className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
    <span className="h-px w-14 bg-gradient-to-l from-transparent to-primary/70 sm:w-20" />
  </div>
);

const MenuContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeParams = useParams<{ keyword?: string | string[] }>();
  const reduceMotion = useReducedMotion();

  const [dishes, setDishes] = useState<MenuDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const rawKeyword = Array.isArray(routeParams.keyword)
    ? routeParams.keyword[0]
    : routeParams.keyword;
  const keyword = rawKeyword ? safeDecode(rawKeyword) : "";

  const category = parseCategory(searchParams.get("category"));
  const diet = parseDiet(searchParams.get("diet"));
  const sort = parseSort(searchParams.get("sort"));

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

  const indexed = useMemo(
    () => dishes.map((dish) => ({ dish, text: buildHaystack(dish) })),
    [dishes],
  );

  const tokens = useMemo(
    () => keyword.toLowerCase().split(/\s+/).filter(Boolean),
    [keyword],
  );

  const matched = useMemo(
    () =>
      indexed
        .filter(
          ({ dish, text }) =>
            tokens.every((t) => text.includes(t)) &&
            (diet === "all" || dish.diet === diet),
        )
        .map(({ dish }) => dish),
    [indexed, tokens, diet],
  );

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
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
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

  const hasActiveFilters =
    keyword !== "" ||
    category !== "all" ||
    diet !== "all" ||
    sort !== "recommended";

  const updateFilters = (
    next: Partial<{
      category: CategoryValue;
      diet: DietValue;
      sort: SortValue;
    }>,
  ) => {
    const qs = buildQuery({ category, diet, sort, ...next });
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };

  const clearKeyword = () => {
    const qs = buildQuery({ category, diet, sort });
    router.push(qs ? `/menu?${qs}` : "/menu", { scroll: false });
  };

  const resetAll = () => {
    router.push("/menu", { scroll: false });
  };

  const retry = () => {
    setError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 38 };

  return (
    <section className="section relative w-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className={SHELL_CLASSES}>
        <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-balance break-words font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {keyword ? `Results for “${keyword}”` : "Explore every dish"}
          </h1>

          <Ornament className="mt-6" />

          <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {keyword
              ? "Narrow it down with the filters below, or clear the search to see everything."
              : "From tandoor classics to modern plates — handpicked, freshly made, and delivered hot."}
          </p>

          {keyword && (
            <button
              type="button"
              onClick={clearKeyword}
              className="mt-6 inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-border bg-card/80 pl-4 pr-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/60 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search aria-hidden className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{keyword}</span>
              <X
                aria-hidden
                className="h-4 w-4 shrink-0 text-muted-foreground"
              />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </header>

        <div className="mx-auto mt-10 w-full max-w-5xl rounded-[2rem] border border-border bg-card/70 p-4 shadow-[0_24px_60px_-32px_rgba(74,46,32,0.35)] backdrop-blur-xl sm:mt-12 sm:p-6">
          <div
            role="group"
            aria-label="Category"
            className="-m-2 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max gap-2 md:w-auto md:flex-wrap md:justify-center">
              {CATEGORIES.map((c) => {
                const active = category === c.value;
                const count = counts[c.value] ?? 0;
                const empty = !active && count === 0;

                return (
                  <button
                    key={c.value}
                    type="button"
                    disabled={empty}
                    aria-pressed={active}
                    onClick={() => updateFilters({ category: c.value })}
                    className={cn(
                      "relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? cn("border-transparent font-semibold", ON_GOLD)
                        : "border-border bg-background/80 text-foreground hover:border-primary/50 hover:bg-background",
                      empty &&
                        "cursor-not-allowed opacity-45 hover:border-border hover:bg-background/80",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="menu-category-pill"
                        transition={pillTransition}
                        className="absolute -inset-px rounded-full bg-primary shadow-[0_10px_24px_-10px] shadow-primary"
                      />
                    )}
                    <span
                      aria-hidden
                      className="relative text-base leading-none"
                    >
                      {c.emoji}
                    </span>
                    <span className="relative">{c.label}</span>
                    <span
                      className={cn(
                        "relative rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                        active
                          ? "bg-black/10"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3 border-t border-border/80 pt-4 sm:mt-5 sm:flex-row sm:justify-center sm:gap-4 sm:pt-5">
            <div
              role="group"
              aria-label="Diet"
              className="flex w-full rounded-full border border-border bg-secondary/70 p-1 sm:w-auto"
            >
              {DIETS.map((d) => {
                const active = diet === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateFilters({ diet: d.value })}
                    className={cn(
                      "relative inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm font-medium transition-colors sm:flex-none sm:px-4",
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
                        className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border"
                      />
                    )}
                    {d.dot && (
                      <span
                        aria-hidden
                        className={cn(
                          "relative hidden h-2 w-2 rounded-full sm:inline-block",
                          d.dot,
                        )}
                      />
                    )}
                    <span className="relative">{d.label}</span>
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full sm:w-56">
              <span className="sr-only">Sort dishes</span>
              <select
                value={sort}
                onChange={(e) =>
                  updateFilters({ sort: e.target.value as SortValue })
                }
                className="h-[46px] w-full appearance-none rounded-full border border-border bg-background/80 pl-5 pr-10 text-sm font-medium text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
            </label>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4 sm:mt-12">
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-transparent to-border"
          />
          <div className="flex items-center gap-3">
            <p
              aria-live="polite"
              className="text-center text-sm text-muted-foreground"
            >
              {loading ? (
                "Loading dishes…"
              ) : error ? (
                "Menu unavailable"
              ) : visible.length === 0 ? (
                "No dishes found"
              ) : (
                <>
                  <span className="font-semibold tabular-nums text-foreground">
                    {visible.length}
                  </span>{" "}
                  {visible.length === 1 ? "dish" : "dishes"}
                </>
              )}
            </p>
            {hasActiveFilters && !loading && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-l from-transparent to-border"
          />
        </div>

        {loading && (
          <div className={cn("mt-8", CARD_LIST_CLASSES)}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={CARD_WIDTH_CLASSES}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card/70 px-6 py-14 text-center backdrop-blur-xl">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
              🍲
            </span>
            <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
              Couldn&apos;t load the menu
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={retry}
              className={cn(
                "mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold shadow-sm transition-all hover:scale-[1.03] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                ON_GOLD,
              )}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-[2rem] border border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
              🍽️
            </span>
            <h2 className="mt-5 break-words font-heading text-2xl font-semibold text-foreground">
              {keyword ? `Nothing found for “${keyword}”` : "Nothing matches"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try a different word, or loosen the filters to see more dishes.
            </p>
            <button
              type="button"
              onClick={resetAll}
              className={cn(
                "mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold shadow-sm transition-all hover:scale-[1.03] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                ON_GOLD,
              )}
            >
              {keyword ? "Show full menu" : "Clear filters"}
            </button>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className={cn("mt-8", CARD_LIST_CLASSES)}>
            <AnimatePresence mode="popLayout">
              {visible.map((dish, index) => (
                <motion.div
                  key={dish._id}
                  layout={!reduceMotion}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -10, scale: 0.98 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.38,
                    delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.3),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={CARD_WIDTH_CLASSES}
                >
                  <ProductCard dish={dish} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

const MenuFallback = () => (
  <section className="section relative w-full overflow-hidden">
    <div className={SHELL_CLASSES}>
      <div className="mx-auto h-14 w-full max-w-md animate-pulse rounded-2xl bg-secondary" />
      <div className="mx-auto mt-6 h-5 w-full max-w-lg animate-pulse rounded-lg bg-secondary" />
      <div className="mx-auto mt-12 h-36 w-full max-w-5xl animate-pulse rounded-[2rem] bg-secondary/70" />
      <div className={cn("mt-12", CARD_LIST_CLASSES)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={CARD_WIDTH_CLASSES}>
            <ProductCardSkeleton />
          </div>
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
