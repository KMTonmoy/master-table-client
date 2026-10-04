"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

const shimmer = `
  @keyframes skeleton-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`;

const ProductCardSkeleton = () => {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <style>{shimmer}</style>
      <motion.div
        aria-hidden
        variants={cardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className={cn(
          "group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/15",
          "shadow-[0_10px_45px_-16px_rgba(74,46,32,0.28)] backdrop-blur-2xl backdrop-saturate-150",
          "dark:border-white/10 dark:bg-white/5 sm:rounded-3xl",
        )}
      >
        {/* Gold ambient glows */}
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(224,165,38,0.35),transparent_70%)] blur-2xl"
        />
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }
          }
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.6,
          }}
          className="pointer-events-none absolute -bottom-14 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(199,142,30,0.3),transparent_70%)] blur-2xl"
        />

        {/* Glass edge highlights */}
        <div className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-[1px] z-10 rounded-[calc(1rem-1px)] ring-1 ring-inset ring-white/40 sm:rounded-[calc(1.5rem-1px)]" />

        {/* Image area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/20">
          {/* Base gold pulse gradient */}
          <motion.div
            aria-hidden
            animate={reduceMotion ? undefined : { opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-br from-[#E0A526]/30 via-[#E0A526]/5 to-transparent"
          />

          {/* Shimmer sweep */}
          <div
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/40 to-transparent"
            style={{
              animation: reduceMotion
                ? undefined
                : "skeleton-shimmer 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite",
            }}
          />

          {/* Category pill placeholder */}
          <div className="absolute left-2 top-2 h-5 w-14 overflow-hidden rounded-full border border-white/50 bg-white/25 backdrop-blur-md sm:h-6 sm:w-16">
            <div
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/50 to-transparent"
              style={{
                animation: reduceMotion
                  ? undefined
                  : "skeleton-shimmer 2s ease-out infinite",
                animationDelay: "0.3s",
              }}
            />
          </div>

          {/* Featured badge placeholder */}
          <div className="absolute right-2 top-2 h-5 w-16 overflow-hidden rounded-full border border-[#E0A526]/40 bg-[#E0A526]/20 backdrop-blur-md sm:h-6 sm:w-20">
            <div
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
              style={{
                animation: reduceMotion
                  ? undefined
                  : "skeleton-shimmer 2s ease-out infinite",
                animationDelay: "0.5s",
              }}
            />
          </div>

          {/* Quick-add button placeholder */}
          <motion.div
            aria-hidden
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }
            }
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full border border-[#E0A526]/40 bg-gradient-to-br from-[#E0A526]/30 to-[#C78E1E]/30 backdrop-blur-md sm:h-9 sm:w-9"
          />
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col p-3 sm:p-4">
          {/* Title + diet mark */}
          <div className="flex items-start justify-between gap-2">
            <div className="relative h-4 w-3/4 overflow-hidden rounded-md bg-white/25 sm:h-5">
              <div
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
                style={{
                  animation: reduceMotion
                    ? undefined
                    : "skeleton-shimmer 2s ease-out infinite",
                }}
              />
            </div>
            <div className="h-3.5 w-3.5 shrink-0 rounded-[3px] border border-white/40 bg-white/20 sm:h-4 sm:w-4" />
          </div>

          {/* Description (2 lines) */}
          <div className="mt-2 space-y-1.5">
            <div className="relative h-2.5 w-full overflow-hidden rounded bg-white/20 sm:h-3">
              <div
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                style={{
                  animation: reduceMotion
                    ? undefined
                    : "skeleton-shimmer 2s ease-out infinite",
                  animationDelay: "0.15s",
                }}
              />
            </div>
            <div className="relative h-2.5 w-2/3 overflow-hidden rounded bg-white/20 sm:h-3">
              <div
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                style={{
                  animation: reduceMotion
                    ? undefined
                    : "skeleton-shimmer 2s ease-out infinite",
                  animationDelay: "0.3s",
                }}
              />
            </div>
          </div>

          {/* Rating + spice row */}
          <div className="mt-2.5 flex items-center gap-3 sm:mt-3">
            <div className="h-3 w-8 rounded bg-white/20 sm:h-3.5 sm:w-10" />
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  aria-hidden
                  animate={
                    reduceMotion ? undefined : { opacity: [0.3, 0.9, 0.3] }
                  }
                  transition={{
                    duration: 1.8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="h-3 w-3 rounded-sm bg-[#E0A526]/40"
                />
              ))}
            </div>
          </div>

          {/* Price row */}
          <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-2.5 sm:pt-3">
            <div className="relative h-3.5 w-12 overflow-hidden rounded bg-white/30 sm:h-4 sm:w-14">
              <div
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent"
                style={{
                  animation: reduceMotion
                    ? undefined
                    : "skeleton-shimmer 2s ease-out infinite",
                  animationDelay: "0.45s",
                }}
              />
            </div>
            <div className="hidden h-3 w-10 rounded bg-white/20 sm:block" />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductCardSkeleton;
