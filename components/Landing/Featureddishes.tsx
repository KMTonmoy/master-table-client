"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDown, ChevronUp, UtensilsCrossed } from "lucide-react";
import ProductCard, { type Dish } from "../Common/Productcard";
import ProductCardSkeleton from "../Skeleton/ProductCardSkeleton";

const PAGE_SIZE = 8;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const EASE = [0.22, 1, 0.36, 1] as const;

const headerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.92,
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

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

  const [baseIndex, setBaseIndex] = useState(PAGE_SIZE);
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
        className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-[#E0A526]/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/15 blur-[120px]"
      />

      <div className="content-wrap relative px-5">
        <motion.div
          variants={headerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <motion.span
              variants={headerItem}
              aria-hidden
              className="mt-1 hidden rounded-full border border-primary/30 bg-primary/10 p-2 text-primary sm:inline-flex"
            >
              <UtensilsCrossed className="h-5 w-5" />
            </motion.span>
            <div>
              <motion.h2 variants={headerItem}>
                Today&apos;s{" "}
                <span className="relative inline-block text-primary">
                  favorites
                  <motion.span
                    variants={{
                      hidden: { scaleX: 0 },
                      show: {
                        scaleX: 1,
                        transition: { duration: 1, ease: EASE, delay: 0.5 },
                      },
                    }}
                    style={{ transformOrigin: "left" }}
                    className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
                  />
                </span>
              </motion.h2>
              <motion.p
                variants={headerItem}
                className="mt-2 max-w-md text-sm text-muted-foreground"
              >
                The dishes our regulars keep coming back for.
              </motion.p>
            </div>
          </div>

          <motion.div variants={headerItem}>
            <Link
              href="/menu"
              className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary"
            >
              <span className="relative">
                View full menu
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
              </span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {loading && (
          <div
            aria-busy="true"
            aria-live="polite"
            className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
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
              className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {visibleDishes.map((dish, index) => {
                  const isNewlyRevealed = index >= firstNewIndex;
                  return (
                    <motion.div
                      key={dish._id}
                      ref={index === firstNewIndex ? firstNewCardRef : undefined}
                      layout
                      variants={cardReveal}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: false, amount: 0.2 }}
                      exit={{ opacity: 0, y: -20, scale: 0.96 }}
                      transition={{
                        delay: isNewlyRevealed ? (index - firstNewIndex) * 0.06 : 0,
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