"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const shimmer = `
  @keyframes cat-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`;

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.94, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

const CategoriesSkeleton = () => {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <style>{shimmer}</style>
      <section className="section relative overflow-hidden">
        {/* Ambient gold glows */}
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.4, 0.75, 0.4], scale: [1, 1.15, 1] }
          }
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#E0A526]/20 blur-[100px]"
        />
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.3, 0.65, 0.3], scale: [1, 1.12, 1] }
          }
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.5,
          }}
          className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/18 blur-[120px]"
        />

        <div className="content-wrap relative px-5">
          {/* Header skeleton */}
          <motion.div
            variants={container}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            className="flex items-end justify-between gap-4"
          >
            <div className="w-full">
              {/* Eyebrow placeholder */}
              <motion.div
                variants={headerItem}
                className="mb-3 flex items-center gap-3"
              >
                <span className="h-px w-10 bg-[#E0A526]/40" />
                <div className="relative h-3 w-24 overflow-hidden rounded bg-[#E0A526]/20">
                  <div
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
                    style={{
                      animation: reduceMotion
                        ? undefined
                        : "cat-shimmer 2.2s ease-out infinite",
                    }}
                  />
                </div>
              </motion.div>

              {/* Headline placeholder */}
              <motion.div
                variants={headerItem}
                className="relative h-7 w-64 overflow-hidden rounded-md bg-border/60 sm:h-9 sm:w-72"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/50 to-transparent"
                  style={{
                    animation: reduceMotion
                      ? undefined
                      : "cat-shimmer 2.2s ease-out infinite",
                  }}
                />
              </motion.div>

              {/* Subcopy placeholder */}
              <motion.div
                variants={headerItem}
                className="mt-3 h-4 w-56 rounded bg-border/50 sm:w-72"
              />
            </div>

            <motion.div
              variants={headerItem}
              className="relative hidden h-4 w-28 overflow-hidden rounded-md bg-border/60 sm:block"
            >
              <div
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/50 to-transparent"
                style={{
                  animation: reduceMotion
                    ? undefined
                    : "cat-shimmer 2.2s ease-out infinite",
                  animationDelay: "0.3s",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Cards skeleton */}
          <motion.div
            variants={container}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            className="mt-8 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                variants={cardItem}
                className="w-[160px] shrink-0 lg:w-auto"
              >
                {/* Image card */}
                <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/70 bg-white/15 shadow-[0_10px_45px_-16px_rgba(74,46,32,0.28)] backdrop-blur-2xl backdrop-saturate-150 sm:rounded-3xl dark:border-white/10 dark:bg-white/5">
                  {/* Gold ambient glow */}
                  <motion.div
                    aria-hidden
                    animate={
                      reduceMotion ? undefined : { opacity: [0.4, 0.75, 0.4] }
                    }
                    transition={{
                      duration: 3 + i * 0.3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E0A526]/25 blur-3xl"
                  />

                  {/* Base pulse */}
                  <motion.div
                    aria-hidden
                    animate={
                      reduceMotion ? undefined : { opacity: [0.4, 0.7, 0.4] }
                    }
                    transition={{
                      duration: 2.4,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-[#E0A526]/30 via-[#E0A526]/5 to-transparent"
                  />

                  {/* Shimmer sweep */}
                  <div
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/45 to-transparent"
                    style={{
                      animation: reduceMotion
                        ? undefined
                        : "cat-shimmer 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
                      animationDelay: `${i * 120}ms`,
                    }}
                  />

                  {/* Glass top highlight */}
                  <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent" />

                  {/* Dish count pill placeholder */}
                  <div className="absolute right-2 top-2 h-5 w-14 overflow-hidden rounded-full border border-white/50 bg-white/25 backdrop-blur-md sm:h-6 sm:w-16">
                    <div
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      style={{
                        animation: reduceMotion
                          ? undefined
                          : "cat-shimmer 2s ease-out infinite",
                        animationDelay: `${i * 120 + 200}ms`,
                      }}
                    />
                  </div>

                  {/* Bottom label placeholder */}
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                    <div className="relative h-3.5 w-16 overflow-hidden rounded bg-white/40 sm:h-4 sm:w-20">
                      <div
                        aria-hidden
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
                        style={{
                          animation: reduceMotion
                            ? undefined
                            : "cat-shimmer 2s ease-out infinite",
                          animationDelay: `${i * 120 + 300}ms`,
                        }}
                      />
                    </div>
                    <div className="h-5 w-5 rounded-full border border-white/40 bg-white/25 backdrop-blur-md sm:h-6 sm:w-6" />
                  </div>
                </div>

                {/* Meta text placeholders */}
                <div className="mt-3 space-y-2">
                  <div
                    className="relative h-4 w-24 overflow-hidden rounded-md bg-border/60 sm:h-5"
                    style={{ animationDelay: `${i * 80 + 60}ms` }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
                      style={{
                        animation: reduceMotion
                          ? undefined
                          : "cat-shimmer 2.2s ease-out infinite",
                        animationDelay: `${i * 120 + 400}ms`,
                      }}
                    />
                  </div>
                  <div
                    className="relative h-3 w-16 overflow-hidden rounded-md bg-border/50 sm:h-3.5"
                    style={{ animationDelay: `${i * 80 + 120}ms` }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/50 to-transparent"
                      style={{
                        animation: reduceMotion
                          ? undefined
                          : "cat-shimmer 2.2s ease-out infinite",
                        animationDelay: `${i * 120 + 500}ms`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CategoriesSkeleton;
