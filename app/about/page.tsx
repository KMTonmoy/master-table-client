"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";

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

const About = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-0 h-80 w-80 rounded-full bg-sky-100/50 blur-3xl dark:bg-white/10"
      />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="section relative">
        <div className="content-wrap relative px-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            {/* Left copy */}
            <div className="flex flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Our Story
              </span>

              <h1 className="mt-5 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                A table where{" "}
                <span className="text-primary">every meal</span> feels like home
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Master Table began as a single wooden counter, a handful of
                family recipes, and a stubborn belief that good food should
                taste like it was made by someone who cares. Twelve years
                later, that belief still runs the kitchen.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="
                    inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground
                    shadow-[0_10px_28px_-10px_rgba(224,165,38,0.5)]
                    transition-all duration-300
                    hover:scale-[1.03] hover:bg-primary/90 active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  "
                >
                  Explore our menu
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/reservations"
                  className="
                    inline-flex h-12 items-center rounded-full border border-white/60 bg-white/20 px-7 text-sm font-semibold text-foreground
                    backdrop-blur-md transition-all duration-300
                    hover:scale-[1.03] hover:bg-white/35 active:scale-[0.98]
                    dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20
                  "
                >
                  Book a table
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/60 bg-white/15 p-3.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="font-heading text-2xl font-bold text-primary">
                      {s.value}
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right images */}
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/15 shadow-[0_30px_80px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[1px] z-20 rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
                />
                <Image
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80"
                  alt="Inside Master Table restaurant"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Floating mini-card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="
                  absolute -bottom-6 -left-4 hidden max-w-[220px] rounded-2xl border border-white/70 bg-white/25 p-4
                  shadow-[0_20px_45px_-20px_rgba(74,46,32,0.4)] backdrop-blur-2xl sm:block
                  dark:border-white/15 dark:bg-white/10
                "
              >
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Since 2012
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  Hand-cooked meals, served warm, every single day.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── VALUES ───────────────────────────────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              What we stand for
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four principles that shape every plate that leaves our kitchen.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    group relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-6
                    shadow-[0_15px_50px_-20px_rgba(74,46,32,0.3)] backdrop-blur-2xl backdrop-saturate-150
                    transition-all duration-500
                    hover:-translate-y-1 hover:border-white/90 hover:bg-white/25 hover:shadow-[0_25px_60px_-20px_rgba(74,46,32,0.4)]
                    dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10
                  "
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl transition-transform duration-700 group-hover:scale-125"
                  />
                  <div className="relative">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                      <Icon className="h-5 w-5" />
                    </div>
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
          </div>
        </div>
      </section>

      {/* ─── CHEFS ────────────────────────────────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              The Team
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Meet the chefs behind the fire
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three decades of combined kitchen experience — and one shared
              obsession with getting the little things right.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CHEFS.map((chef, i) => (
              <motion.div
                key={chef.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  group relative overflow-hidden rounded-3xl border border-white/70 bg-white/15
                  shadow-[0_20px_60px_-25px_rgba(74,46,32,0.35)] backdrop-blur-2xl backdrop-saturate-150
                  transition-all duration-500
                  hover:-translate-y-1 hover:border-white/90 hover:shadow-[0_30px_75px_-25px_rgba(74,46,32,0.45)]
                  dark:border-white/10 dark:bg-white/5
                "
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={chef.image}
                    alt={chef.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute inset-x-4 bottom-4 z-10">
                    <h3 className="font-heading text-xl font-bold text-white">
                      {chef.name}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                      {chef.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Utensils className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {chef.specialty}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <Award className="h-3.5 w-3.5" />
                    Chef
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Milestones
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              A dozen years in the making
            </h2>
          </div>

          <div className="relative mt-12">
            {/* Vertical line */}
            <div
              aria-hidden
              className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent sm:left-1/2 sm:-translate-x-px"
            />

            <ul className="space-y-8">
              {TIMELINE.map((item, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.li
                    key={item.year}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative pl-14 sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0"
                  >
                    {/* Dot */}
                    <span
                      aria-hidden
                      className="absolute left-4 top-3 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-primary ring-4 ring-primary/20 sm:left-1/2"
                    />

                    {isLeft ? (
                      <>
                        <div className="sm:pr-12 sm:text-right">
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

      {/* ─── LOCATION STRIP ───────────────────────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-8 shadow-[0_25px_70px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl sm:p-10 dark:border-white/10 dark:bg-white/5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-sky-100/40 blur-3xl dark:bg-white/10"
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
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section className="section relative">
        <div className="content-wrap px-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-primary/15 via-white/15 to-sky-100/20 p-10 text-center shadow-[0_30px_80px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl sm:p-14 dark:border-white/10 dark:from-primary/10 dark:via-white/5 dark:to-white/5"
          >
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Come sit at our table
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Whether it&apos;s a quiet dinner for two or a celebration for
              twenty, we&apos;ll set the table like you never left home.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/reservations"
                className="
                  inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground
                  shadow-[0_10px_28px_-10px_rgba(224,165,38,0.55)]
                  transition-all duration-300
                  hover:scale-[1.03] hover:bg-primary/90 active:scale-[0.98]
                "
              >
                Book a table
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/menu"
                className="
                  inline-flex h-12 items-center rounded-full border border-white/60 bg-white/25 px-7 text-sm font-semibold text-foreground
                  backdrop-blur-md transition-all duration-300
                  hover:scale-[1.03] hover:bg-white/40 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20
                "
              >
                Browse the menu
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

/* ─── Small helpers ─────────────────────────────────── */

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
      hover:-translate-y-0.5 hover:border-white/90 hover:bg-white/25
      dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10
      ${align === "right" ? "sm:text-right" : ""}
    `}
  >
    <span className="font-heading text-2xl font-bold text-primary">
      {item.year}
    </span>
    <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
      {item.title}
    </h3>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
  <div className="flex items-start gap-4">
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
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
  </div>
);

export default About;