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
    href: "/menu/tandoor",
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    accent: "#E0A526",
  },
  {
    name: "Curries",
    dishCount: 14,
    href: "/menu/curries",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    accent: "#C78E1E",
  },
  {
    name: "Biryani",
    dishCount: 6,
    href: "/menu/biryani",
    image:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    accent: "#B8751A",
  },
  {
    name: "Breads",
    dishCount: 8,
    href: "/menu/breads",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    accent: "#A85F1A",
  },
  {
    name: "Desserts",
    dishCount: 5,
    href: "/menu/desserts",
    image:
      "https://images.unsplash.com/photo-1601303516534-bf0b0e3e8e1f?auto=format&fit=crop&w=800&q=80",
    accent: "#8A4B14",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
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
      {/* Ambient background mist so the glass has something to blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl dark:bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="content-wrap relative px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-end justify-between gap-4"
        >
          <h2>Find what you&apos;re craving</h2>
          <Link
            href="/menu"
            className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-primary sm:inline-flex"
          >
            <span className="relative">
              View full menu
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible"
        >
          {CATEGORIES.map((category, i) => (
            <motion.div
              key={category.name}
              variants={cardVariant}
              className="w-[160px] shrink-0 lg:w-auto"
            >
              <Link href={category.href} className="group block">
                {/* Frosted cool-glass card */}
                <div
                  className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-2 shadow-[0_10px_45px_-14px_rgba(30,64,110,0.25)] backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500 group-hover:border-white/90 group-hover:bg-white/25 group-hover:shadow-[0_28px_70px_-18px_rgba(30,64,110,0.35)] dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-white/10"
                >
                  {/* Layered "water smoke" — cool ice-white, drifts slowly on hover */}
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
                    className="pointer-events-none absolute left-1/3 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_70%)]"
                  />

                  {/* Soft top sheen, cooled */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[rgba(236,244,255,0.7)] to-transparent"
                  />
                  {/* Hairline top highlight */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent"
                  />
                  {/* Inner glass border for that etched-edge look */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
                  />

                  {/* Accent glow blob */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
                    style={{ backgroundColor: category.accent }}
                  />

                  {/* Image inside inner rounded frame */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, 160px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                    />

                    {/* Dark gradient for legibility */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

                    {/* Dish count pill — cool misty glass */}
                    <span className="absolute right-2 top-2 rounded-full border border-white/60 bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md backdrop-saturate-150">
                      {category.dishCount} dishes
                    </span>

                    {/* Name + arrow overlay */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                      <p className="font-heading text-lg font-semibold text-white drop-shadow-md">
                        {category.name}
                      </p>
                      <span className="flex h-7 w-7 translate-y-1 items-center justify-center rounded-full border border-white/60 bg-white/20 text-xs font-bold text-white opacity-0 backdrop-blur-md backdrop-saturate-150 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        →
                      </span>
                    </div>
                  </div>

                  {/* Caption inside the glass frame */}
                  <div className="relative flex items-center justify-between px-2 pb-1 pt-3">
                    <div>
                      <p className="font-heading text-base font-semibold text-foreground">
                        {category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.dishCount} dishes
                      </p>
                    </div>
                    <span
                      className="hidden text-[11px] font-medium lg:block"
                      style={{ color: category.accent }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;