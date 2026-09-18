"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard, { type Dish, type DishCategory } from "@/components/Common/Productcard";
import ProductCardSkeleton from "@/components/Skeleton/ProductCardSkeleton";
import { cn } from "@/lib/utils";

const CATEGORIES: { label: string; value: "all" | DishCategory }[] = [
  { label: "All", value: "all" },
  { label: "Food", value: "food" },
  { label: "Chicken", value: "chicken" },
  { label: "Beef", value: "beef" },
  { label: "Seafood", value: "seafood" },
  { label: "Vegan", value: "vegan" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Snacks", value: "snacks" },
  { label: "Dessert", value: "dessert" },
  { label: "Soft drink", value: "soft-drink" },
  { label: "Hard drink", value: "hard-drink" },
];

const DIETS = [
  { label: "All", value: "all" },
  { label: "Veg", value: "veg" },
  { label: "Vegan", value: "vegan" },
  { label: "Non-veg", value: "non-veg" },
] as const;

type DietFilter = (typeof DIETS)[number]["value"];

const MenuPage = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | DishCategory>("all");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get<Dish[]>("http://localhost:8000/products")
      .then((res) => {
        if (!cancelled) setDishes(res.data);
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
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return dishes.filter((d) => {
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.cuisine ?? "").toLowerCase().includes(q) ||
        (d.tags ?? []).some((t) => t.toLowerCase().includes(q));

      const matchesCategory = category === "all" || d.category === category;
      const matchesDiet = diet === "all" || d.diet === diet;

      return matchesSearch && matchesCategory && matchesDiet;
    });
  }, [dishes, search, category, diet]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setDiet("all");
  };

  const hasActiveFilters =
    search.trim() !== "" || category !== "all" || diet !== "all";

  return (
    <section className="section relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl dark:bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="content-wrap relative px-5 py-10">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our Menu
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Explore every dish
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            From tandoor classics to modern plates — handpicked, freshly made,
            and delivered hot.
          </p>
        </header>

        {/* Search + filters toggle */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, cuisines, tags…"
              className="
                h-12 w-full rounded-full border border-white/60 bg-white/15 pl-11 pr-4 text-sm text-foreground
                placeholder:text-muted-foreground/70 backdrop-blur-md backdrop-saturate-150
                transition-all duration-300
                focus:border-primary/50 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-primary/30
                dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10
              "
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/30 hover:text-foreground dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              showFilters
                ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(74,46,32,0.5)]"
                : "border-white/60 bg-white/15 text-foreground backdrop-blur-md hover:bg-white/25 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-3xl border border-white/60 bg-white/15 p-5 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
                {/* Category chips */}
                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                          category === c.value
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-white/60 bg-white/20 text-foreground hover:bg-white/35 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet chips */}
                <div className="mt-5">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Diet
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDiet(d.value)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                          diet === d.value
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-white/60 bg-white/20 text-foreground hover:bg-white/35 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/60 bg-white/15 px-4 text-xs font-semibold text-muted-foreground transition-all hover:bg-white/30 hover:text-foreground dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/15"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!loading && !error && (
          <p className="mt-6 text-sm text-muted-foreground">
            {filtered.length === 0
              ? "No dishes match your filters"
              : `Showing ${filtered.length} ${
                  filtered.length === 1 ? "dish" : "dishes"
                }`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="mt-6 rounded-2xl border border-white/60 bg-white/15 p-6 text-sm text-muted-foreground backdrop-blur-2xl">
            Couldn&apos;t load the menu right now. Try refreshing the page.
          </p>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/15 p-10 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
            <span className="text-4xl">🍽️</span>
            <h3 className="font-heading text-xl font-semibold">
              Nothing matches
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or clearing the filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.03] hover:bg-primary/90"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            layout
            className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((dish, index) => (
                <motion.div
                  key={dish._id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.03, 0.3),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ProductCard dish={dish} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default MenuPage;