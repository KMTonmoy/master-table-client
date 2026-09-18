"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, UtensilsCrossed } from "lucide-react";
import ProductCard, { type Dish } from "../Common/Productcard";
import ProductCardSkeleton from "../Skeleton/ProductCardSkeleton";

const PAGE_SIZE = 8;

// Bug fix: this was hardcoded to localhost, which breaks in staging/production.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const FeaturedDishes = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Bug fix: `firstNewIndex` used to be read from a ref's `.current` during
  // render, which throws "Cannot access refs during render". Refs must only
  // be read in effects/handlers, so this is plain state instead.
  const [baseIndex, setBaseIndex] = useState(PAGE_SIZE);
  // Bug fix: calling setBaseIndex from inside a useEffect keyed on
  // visibleCount triggered "Avoid calling setState() directly within an
  // effect" — an extra, avoidable render pass. Instead we track the last
  // visibleCount we've "committed" and adjust baseIndex during render
  // itself (React's documented pattern for deriving state from a prop/state
  // change: https://react.dev/learn/you-might-not-need-an-effect). This
  // still runs before paint and gives the exact same timing as before.
  const [committedVisibleCount, setCommittedVisibleCount] = useState(PAGE_SIZE);

  if (visibleCount !== committedVisibleCount) {
    setBaseIndex(committedVisibleCount);
    setCommittedVisibleCount(visibleCount);
  }

  const firstNewCardRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get<Dish[]>(`${API_BASE_URL}/products`)
      .then((res) => {
        if (cancelled) return;

        const all = res.data;
        const featured = shuffle(all.filter((d) => d.isFeatured));
        const nonFeatured = shuffle(all.filter((d) => !d.isFeatured));

        setDishes([...featured, ...nonFeatured]);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && firstNewCardRef.current) {
      firstNewCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      shouldScrollRef.current = false;
    }
  }, [visibleCount]);

  const visibleDishes = useMemo(
    () => dishes.slice(0, visibleCount),
    [dishes, visibleCount]
  );

  const hasMore = visibleCount < dishes.length;
  const canShowLess = visibleCount > PAGE_SIZE;

  const handleShowMore = () => {
    shouldScrollRef.current = true;
    setVisibleCount((c) => c + PAGE_SIZE);
  };

  const handleShowLess = () => {
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const firstNewIndex = baseIndex;

  return (
    <section className="section relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl dark:bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="content-wrap relative px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-1 hidden rounded-full border border-primary/30 bg-primary/10 p-2 text-primary sm:inline-flex"
            >
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <div>
              <h2>Today&apos;s favorites</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                The dishes our regulars keep coming back for.
              </p>
            </div>
          </div>
          <Link
            href="/menu"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            View full menu
          </Link>
        </div>

        {loading && (
          <div
            aria-busy="true"
            aria-live="polite"
            className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          >
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p
            role="status"
            className="mt-8 rounded-2xl border border-white/60 bg-white/15 p-6 text-sm text-muted-foreground backdrop-blur-2xl"
          >
            Couldn&apos;t load today&apos;s favorites right now. Try refreshing
            the page.
          </p>
        )}

        {!loading && !error && dishes.length === 0 && (
          <p className="mt-8 rounded-2xl border border-white/60 bg-white/15 p-6 text-sm text-muted-foreground backdrop-blur-2xl">
            Nothing on the menu yet — check back soon.
          </p>
        )}

        {!loading && !error && dishes.length > 0 && (
          <>
            <motion.div
              layout
              className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {visibleDishes.map((dish, index) => {
                  const isNewlyRevealed = index >= firstNewIndex;
                  return (
                    <motion.div
                      key={dish._id}
                      ref={index === firstNewIndex ? firstNewCardRef : undefined}
                      layout
                      initial={
                        isNewlyRevealed
                          ? { opacity: 0, y: 40, scale: 0.96 }
                          : false
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.96 }}
                      transition={{
                        duration: 0.5,
                        delay: isNewlyRevealed
                          ? (index - firstNewIndex) * 0.06
                          : 0,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <ProductCard dish={dish} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {(hasMore || canShowLess) && (
              <div className="mt-10 flex items-center justify-center gap-3">
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleShowMore}
                    aria-expanded={false}
                    className="
                      group inline-flex h-11 items-center justify-center gap-2 rounded-full
                      bg-primary px-8 text-sm font-semibold text-primary-foreground
                      shadow-[0_8px_24px_-8px_rgba(74,46,32,0.45)]
                      transition-all duration-300
                      hover:scale-[1.04] hover:bg-primary/90 hover:shadow-[0_12px_28px_-8px_rgba(74,46,32,0.55)]
                      active:scale-[0.98]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    "
                  >
                    Show more
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </button>
                )}

                {canShowLess && (
                  <button
                    type="button"
                    onClick={handleShowLess}
                    aria-expanded={true}
                    className="
                      group inline-flex h-11 items-center justify-center gap-2 rounded-full
                      bg-secondary px-8 text-sm font-semibold text-secondary-foreground
                      shadow-[0_8px_20px_-10px_rgba(74,46,32,0.3)]
                      transition-all duration-300
                      hover:scale-[1.04] hover:bg-accent hover:text-accent-foreground
                      active:scale-[0.98]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    "
                  >
                    Show less
                    <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedDishes;