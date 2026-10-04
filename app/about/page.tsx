"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Utensils,
  Heart,
  Leaf,
  Award,
  ChefHat,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Quote,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const VALUES = [
  {
    icon: Utensils,
    title: "Craft First",
    text: "Every dish is built from scratch — no shortcuts, no frozen bases, no compromises.",
  },
  {
    icon: Leaf,
    title: "Fresh & Local",
    text: "We source produce from regional farms within 48 hours of it hitting your plate.",
  },
  {
    icon: Heart,
    title: "Made With Love",
    text: "Recipes passed down through generations, cooked with the care of a home kitchen.",
  },
  {
    icon: Award,
    title: "Award Winning",
    text: "Voted Best Indian Kitchen three years running by the City Food Critics Circle.",
  },
];

const CHEFS = [
  {
    name: "Arjun Mehta",
    role: "Executive Chef",
    image:
      "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80",
    specialty: "Tandoor & Mughlai",
  },
  {
    name: "Priya Sharma",
    role: "Head of Pastry",
    image:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80",
    specialty: "Desserts & Sweets",
  },
  {
    name: "Marco Bianchi",
    role: "Sous Chef",
    image:
      "https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=800&q=80",
    specialty: "Continental & Grills",
  },
];

const TIMELINE = [
  {
    year: "2012",
    title: "The First Table",
    text: "Master Table opens as a 20-seat neighborhood kitchen in the heart of the old market.",
  },
  {
    year: "2016",
    title: "A Bigger Home",
    text: "We move to our current 120-seat space, adding a dedicated tandoor room and bar.",
  },
  {
    year: "2020",
    title: "Through the Storm",
    text: "We pivoted to delivery, feeding over 40,000 frontline workers during the pandemic.",
  },
  {
    year: "2024",
    title: "Best in the City",
    text: "Named Best Indian Kitchen by the City Food Critics Circle for the third year running.",
  },
];

const STATS = [
  { value: "12+", label: "Years serving" },
  { value: "48", label: "Signature dishes" },
  { value: "3×", label: "Award winner" },
  { value: "100k+", label: "Happy guests" },
];

/* ---------------------------------------------------------- */
/*              LUXURY ANIMATION VARIANTS                      */
/* ---------------------------------------------------------- */

const heroContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.08, filter: "blur(12px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.3, ease: EASE },
  },
};

const sectionHeaderContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const sectionHeaderItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.94, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const timelineItem: Variants = {
  hidden: (align: "left" | "right") => ({
    opacity: 0,
    x: align === "left" ? 40 : -40,
    filter: "blur(8px)",
  }),
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const About = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      {/* Ambient gold glows */}
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#E0A526]/15 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.12, 1] }
        }
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.5,
        }}
        className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#C78E1E]/15 blur-[120px]"
      />

      {/* ───────────────── HERO ───────────────── */}
      <section className="section relative">
        <div className="content-wrap relative px-5">
          <motion.div
            variants={heroContainer}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            {/* Left copy */}
            <div className="flex flex-col">
              <motion.span
                variants={heroItem}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E0A526]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Our Story
              </motion.span>

              <motion.h1
                variants={heroItem}
                className="mt-5 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                A table where{" "}
                <span className="relative inline-block text-[#E0A526]">
                  every meal
                  <motion.span
                    aria-hidden
                    variants={{
                      hidden: { scaleX: 0 },
                      show: {
                        scaleX: 1,
                        transition: { duration: 1, ease: EASE, delay: 0.6 },
                      },
                    }}
                    style={{ transformOrigin: "left" }}
                    className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
                  />
                </span>{" "}
                feels like home
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Master Table began as a single wooden counter, a handful of
                family recipes, and a stubborn belief that good food should
                taste like it was made by someone who cares. Twelve years later,
                that belief still runs the kitchen.
              </motion.p>

              <motion.div
                variants={heroItem}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/menu"
                  className="
                    group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full
                    bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-7 text-sm font-semibold text-[#3B2416]
                    shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
                    transition-shadow duration-500
                    hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  "
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    Explore our menu
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
                <Link
                  href="/reservations"
                  className="
                    inline-flex h-12 items-center rounded-full border border-[#E0A526]/40 bg-white/20 px-7 text-sm font-semibold text-foreground
                    backdrop-blur-md transition-all duration-300
                    hover:scale-[1.03] hover:border-[#E0A526]/70 hover:bg-[#E0A526]/5
                    dark:border-[#E0A526]/30 dark:bg-white/10 dark:hover:bg-[#E0A526]/10
                  "
                >
                  Book a table
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={heroContainer}
                className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
              >
                {STATS.map((s) => (
                  <motion.div
                    key={s.label}
                    variants={cardReveal}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -4, transition: { duration: 0.3, ease: EASE } }
                    }
                    className="
                      group/stat relative overflow-hidden rounded-2xl border border-white/60 bg-white/15 p-3.5
                      backdrop-blur-md transition-colors duration-500
                      hover:border-[#E0A526]/40
                      dark:border-white/10 dark:bg-white/5
                    "
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#E0A526]/0 blur-2xl transition-all duration-700 group-hover/stat:bg-[#E0A526]/40"
                    />
                    <div className="relative font-heading text-2xl font-bold text-[#E0A526]">
                      {s.value}
                    </div>
                    <div className="relative mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right images */}
            <motion.div variants={imageReveal} className="relative">
              <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/15 shadow-[0_30px_80px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[1px] z-20 rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent"
                />
                <Image
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80"
                  alt="Inside Master Table restaurant"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E0A526]/30 blur-3xl"
                />
              </div>

              {/* Floating mini-card */}
              <motion.div
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 20, scale: 0.95, filter: "blur(8px)" }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6, transition: { duration: 0.3, ease: EASE } }
                }
                className="
                  absolute -bottom-6 -left-4 hidden max-w-[220px] rounded-2xl border border-[#E0A526]/30 bg-white/25 p-4
                  shadow-[0_20px_45px_-20px_rgba(74,46,32,0.4)] backdrop-blur-2xl sm:block
                  dark:border-[#E0A526]/20 dark:bg-white/10
                "
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-[#E0A526]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#E0A526]">
                    Since 2012
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  Hand-cooked meals, served warm, every single day.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────── VALUES ───────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <motion.div
            variants={sectionHeaderContainer}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.4 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={sectionHeaderItem}
              className="mb-4 flex items-center justify-center gap-3"
            >
              <span className="h-px w-10 bg-[#E0A526]" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E0A526]">
                What We Stand For
              </span>
              <span className="h-px w-10 bg-[#E0A526]" />
            </motion.div>
            <motion.h2
              variants={sectionHeaderItem}
              className="font-heading text-3xl font-bold text-foreground sm:text-4xl"
            >
              Our principles
            </motion.h2>
            <motion.p
              variants={sectionHeaderItem}
              className="mt-3 text-muted-foreground"
            >
              Four principles that shape every plate that leaves our kitchen.
            </motion.p>
          </motion.div>

          <motion.div
            variants={heroContainer}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  variants={cardReveal}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -6, transition: { duration: 0.35, ease: EASE } }
                  }
                  className="
                    group relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-6
                    shadow-[0_15px_50px_-20px_rgba(74,46,32,0.3)] backdrop-blur-2xl backdrop-saturate-150
                    transition-colors duration-500
                    hover:border-[#E0A526]/50 hover:bg-white/25 hover:shadow-[0_25px_60px_-20px_rgba(74,46,32,0.4)]
                    dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10
                  "
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#E0A526]/15 blur-2xl transition-transform duration-700 group-hover:scale-125"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/50 to-transparent"
                  />
                  <div className="relative">
                    <motion.div
                      whileHover={
                        reduceMotion ? undefined : { rotate: -6, scale: 1.08 }
                      }
                      transition={{ duration: 0.4, ease: EASE }}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E0A526]/20 to-[#C78E1E]/10 text-[#E0A526] ring-1 ring-inset ring-[#E0A526]/30"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {v.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ───────────────── CHEFS ───────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <motion.div
            variants={sectionHeaderContainer}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.4 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={sectionHeaderItem}
              className="mb-4 flex items-center justify-center gap-3"
            >
              <span className="h-px w-10 bg-[#E0A526]" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E0A526]">
                The Team
              </span>
              <span className="h-px w-10 bg-[#E0A526]" />
            </motion.div>
            <motion.h2
              variants={sectionHeaderItem}
              className="font-heading text-3xl font-bold text-foreground sm:text-4xl"
            >
              Meet the chefs behind the fire
            </motion.h2>
            <motion.p
              variants={sectionHeaderItem}
              className="mt-3 text-muted-foreground"
            >
              Three decades of combined kitchen experience — and one shared
              obsession with getting the little things right.
            </motion.p>
          </motion.div>

          <motion.div
            variants={heroContainer}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {CHEFS.map((chef) => (
              <motion.div
                key={chef.name}
                variants={cardReveal}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -8, transition: { duration: 0.4, ease: EASE } }
                }
                className="
                  group relative overflow-hidden rounded-3xl border border-white/70 bg-white/15
                  shadow-[0_20px_60px_-25px_rgba(74,46,32,0.35)] backdrop-blur-2xl backdrop-saturate-150
                  transition-colors duration-500
                  hover:border-[#E0A526]/50 hover:shadow-[0_30px_75px_-25px_rgba(74,46,32,0.45)]
                  dark:border-white/10 dark:bg-white/5
                "
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={chef.image}
                    alt={chef.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E0A526]/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <h3 className="font-heading text-xl font-bold text-white">
                      {chef.name}
                    </h3>
                    <p className="text-sm font-medium text-[#E0A526]">
                      {chef.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Utensils className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {chef.specialty}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E0A526]">
                    <Award className="h-3.5 w-3.5" />
                    Chef
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────── TIMELINE ───────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <motion.div
            variants={sectionHeaderContainer}
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.4 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              variants={sectionHeaderItem}
              className="mb-4 flex items-center justify-center gap-3"
            >
              <span className="h-px w-10 bg-[#E0A526]" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E0A526]">
                Milestones
              </span>
              <span className="h-px w-10 bg-[#E0A526]" />
            </motion.div>
            <motion.h2
              variants={sectionHeaderItem}
              className="font-heading text-3xl font-bold text-foreground sm:text-4xl"
            >
              A dozen years in the making
            </motion.h2>
          </motion.div>

          <div className="relative mt-12">
            <motion.div
              aria-hidden
              initial={reduceMotion ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1.4, ease: EASE }}
              style={{ transformOrigin: "top" }}
              className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#E0A526]/60 via-border to-transparent sm:left-1/2 sm:-translate-x-px"
            />

            <ul className="space-y-8">
              {TIMELINE.map((item, i) => {
                const isLeft = i % 2 === 0;
                const align = isLeft ? "right" : "left";
                return (
                  <motion.li
                    key={item.year}
                    custom={align}
                    variants={timelineItem}
                    initial={reduceMotion ? false : "hidden"}
                    whileInView="show"
                    viewport={{ once: false, amount: 0.3 }}
                    className="relative pl-14 sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0"
                  >
                    <motion.span
                      aria-hidden
                      initial={reduceMotion ? false : { scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2,
                      }}
                      className="absolute left-4 top-3 z-10 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_0_0_4px_var(--background),0_0_16px_rgba(224,165,38,0.5)] sm:left-1/2"
                    />

                    {isLeft ? (
                      <>
                        <div className="sm:pr-12">
                          <TimelineCard item={item} align="right" />
                        </div>
                        <div />
                      </>
                    ) : (
                      <>
                        <div />
                        <div className="sm:pl-12">
                          <TimelineCard item={item} align="left" />
                        </div>
                      </>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────────── LOCATION ───────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: 30, filter: "blur(10px)" }
            }
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-8 shadow-[0_25px_70px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl sm:p-10 dark:border-white/10 dark:bg-white/5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
            />
            <motion.div
              aria-hidden
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }
              }
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#E0A526]/20 blur-3xl"
            />
            <motion.div
              aria-hidden
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.25, 0.6, 0.25], scale: [1, 1.1, 1] }
              }
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.6,
              }}
              className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#C78E1E]/20 blur-3xl"
            />

            <div className="relative grid gap-8 sm:grid-cols-3">
              <InfoBlock
                icon={<MapPin className="h-5 w-5" />}
                title="Find us"
                lines={["128 Saffron Lane", "Old Market District"]}
              />
              <InfoBlock
                icon={<Clock className="h-5 w-5" />}
                title="Open hours"
                lines={["Mon – Thu · 11am – 10pm", "Fri – Sun · 11am – 12am"]}
              />
              <InfoBlock
                icon={<Utensils className="h-5 w-5" />}
                title="Reservations"
                lines={["+1 (555) 021-9000", "hello@mastertable.com"]}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: 30, filter: "blur(10px)" }
            }
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-[#E0A526]/15 via-white/15 to-[#C78E1E]/10 p-10 text-center shadow-[0_30px_80px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl sm:p-14 dark:border-white/10 dark:from-[#E0A526]/10 dark:via-white/5 dark:to-[#C78E1E]/5"
          >
            <motion.div
              aria-hidden
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }
              }
              transition={{
                duration: 4.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E0A526]/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent"
            />

            <motion.div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526] ring-1 ring-inset ring-[#E0A526]/30">
                <Quote className="h-6 w-6" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Come sit at our table
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Whether it&apos;s a quiet dinner for two or a celebration for
                twenty, we&apos;ll set the table like you never left home.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <motion.div
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale: 1.03,
                          transition: { duration: 0.3, ease: EASE },
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Link
                    href="/reservations"
                    className="
                      group/btn relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full
                      bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-7 text-sm font-semibold text-[#3B2416]
                      shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
                      transition-shadow duration-500
                      hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
                    "
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                    <span className="relative flex items-center gap-2">
                      Book a table
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale: 1.03,
                          transition: { duration: 0.3, ease: EASE },
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Link
                    href="/menu"
                    className="
                      inline-flex h-12 items-center rounded-full border border-[#E0A526]/40 bg-white/25 px-7 text-sm font-semibold text-foreground
                      backdrop-blur-md transition-colors duration-300
                      hover:border-[#E0A526]/70 hover:bg-[#E0A526]/5
                      dark:border-[#E0A526]/30 dark:bg-white/10 dark:hover:bg-[#E0A526]/10
                    "
                  >
                    Browse the menu
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

/* ─── Helpers ─────────────────────────────────── */

const TimelineCard = ({
  item,
  align,
}: {
  item: (typeof TIMELINE)[number];
  align: "left" | "right";
}) => (
  <div
    className={`
      group relative overflow-hidden rounded-2xl border border-white/70 bg-white/15 p-5
      shadow-[0_15px_45px_-20px_rgba(74,46,32,0.3)] backdrop-blur-2xl backdrop-saturate-150
      transition-all duration-500
      hover:-translate-y-0.5 hover:border-[#E0A526]/40 hover:bg-white/25 hover:shadow-[0_20px_55px_-20px_rgba(74,46,32,0.4)]
      dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10
      ${align === "right" ? "sm:text-right" : ""}
    `}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#E0A526]/10 blur-2xl transition-transform duration-700 group-hover:scale-125"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/40 to-transparent"
    />
    <span className="relative font-heading text-2xl font-bold text-[#E0A526]">
      {item.year}
    </span>
    <h3 className="relative mt-1 font-heading text-lg font-semibold text-foreground">
      {item.title}
    </h3>
    <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
      {item.text}
    </p>
  </div>
);

const InfoBlock = ({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) => (
  <motion.div
    whileHover={{
      y: -4,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    }}
    className="group flex items-start gap-4"
  >
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E0A526]/20 to-[#C78E1E]/10 text-[#E0A526] ring-1 ring-inset ring-[#E0A526]/30 transition-transform duration-500 group-hover:scale-110">
      {icon}
    </span>
    <div>
      <h4 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h4>
      {lines.map((line) => (
        <p key={line} className="mt-0.5 text-sm text-muted-foreground">
          {line}
        </p>
      ))}
    </div>
  </motion.div>
);

export default About;
