"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import CategoriesSkeleton from "../Skeleton/CategoriesSkeleton";

type Category = {
  name: string;
  dishCount: number;
  href: string;
  image: string;
  accent: string;
};

const CATEGORIES: Category[] = [
  {
    name: "Tandoor",
    dishCount: 9,
    href: "/menu?q=tandoor",
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    accent: "#E0A526",
  },
  {
    name: "Curries",
    dishCount: 14,
    href: "/menu?q=curry",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    accent: "#C78E1E",
  },
  {
    name: "Biryani",
    dishCount: 6,
    href: "/menu?q=biryani",
    image:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    accent: "#B8751A",
  },
  {
    name: "Breads",
    dishCount: 8,
    href: "/menu?q=bread",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    accent: "#A85F1A",
  },
  {
    name: "Desserts",
    dishCount: 5,
    href: "/menu?q=dessert",
    image:
      "https://images.unsplash.com/photo-1601303516534-bf0b0e3e8e1f?auto=format&fit=crop&w=800&q=80",
    accent: "#8A4B14",
  },
];

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

const cardVariant: Variants = {
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

const Categories = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <CategoriesSkeleton />;

  return (
    <section className="section relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-[#E0A526]/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#C78E1E]/15 blur-[120px]"
      />

      <div className="content-wrap relative px-5">
        {/* HEADER */}
        <motion.div
          variants={headerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="flex items-end justify-between gap-4"
        >
          <div>
            <motion.div
              variants={headerItem}
              className="mb-3 flex items-center gap-3"
            >
              <span className="h-px w-10 bg-[#E0A526]" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E0A526] sm:text-xs">
                Explore Our Menu
              </span>
            </motion.div>

            <motion.h2
              variants={headerItem}
              className="font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl"
            >
              Find what you&apos;re{" "}
              <span className="relative inline-block text-[#E0A526]">
                craving
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
              className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base"
            >
              Handpicked categories, crafted with authentic spices and slow-cooked tradition.
            </motion.p>
          </div>

          <motion.div variants={headerItem}>
            <Link
              href="/menu"
              className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex"
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

        {/* GRID */}
        <div className="mt-10 grid gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category, i) => (
            <motion.div
              key={category.name}
              variants={cardVariant}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.35, ease: EASE } }}
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Link
                href={category.href}
                aria-label={`Browse ${category.name}`}
                className="group block h-full"
              >
                <div
                  className="
                    relative h-full overflow-hidden rounded-3xl
                    border border-white/70 bg-white/15 p-2
                    shadow-[0_10px_45px_-14px_rgba(30,64,110,0.25)]
                    backdrop-blur-3xl backdrop-saturate-150
                    transition-all duration-500
                    group-hover:border-white/90 group-hover:bg-white/25
                    group-hover:shadow-[0_28px_70px_-18px_rgba(30,64,110,0.35)]
                    dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-white/10
                  "
                >
                  {/* Reflective highlights */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -left-10 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(236,244,255,0.9),transparent_70%)] blur-2xl transition-transform duration-[1400ms] ease-out group-hover:translate-x-3 group-hover:translate-y-2 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(220,235,255,0.75),transparent_70%)] blur-2xl transition-transform duration-[1600ms] ease-out group-hover:-translate-x-2 group-hover:-translate-y-3 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[rgba(236,244,255,0.7)] to-transparent"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
                    style={{ backgroundColor: category.accent }}
                  />

                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.12]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-95" />

                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                    />

                    <span className="absolute right-2 top-2 rounded-full border border-white/60 bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md backdrop-saturate-150 sm:text-[11px]">
                      {category.dishCount} dishes
                    </span>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                      <p className="font-heading text-base font-semibold text-white drop-shadow-md sm:text-lg">
                        {category.name}
                      </p>
                      <span className="flex h-7 w-7 translate-y-1 items-center justify-center rounded-full border border-white/60 bg-white/20 text-xs font-bold text-white opacity-0 backdrop-blur-md backdrop-saturate-150 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        →
                      </span>
                    </div>
                  </div>

                  {/* Footer meta */}
                  <div className="relative flex items-center justify-between px-2 pb-1 pt-3">
                    <div>
                      <p className="font-heading text-sm font-semibold text-foreground sm:text-base">
                        {category.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground sm:text-xs">
                        {category.dishCount} dishes
                      </p>
                    </div>
                    <span
                      className="hidden font-heading text-[11px] font-medium lg:block"
                      style={{ color: category.accent }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* MOBILE CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5, once: false }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-8 flex justify-center sm:hidden"
        >
          <Link
            href="/menu"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-10px_rgba(224,165,38,0.55)] transition-all duration-500 hover:scale-[1.03]"
          >
            <span className="absolute inset-0 -translate-y-full bg-gradient-to-b from-[#C78E1E] to-[#E0A526] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
            <span className="relative z-10 flex items-center gap-2">
              View full menu
              <span className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;