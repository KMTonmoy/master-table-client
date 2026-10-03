"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const STATS = [
  { label: "In business since", value: "1985" },
  { label: "Recipes on the menu", value: "60+" },
  { label: "Cities we cook in", value: "4" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const contentContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const contentItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const imageVariant: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.15,
    x: -40,
    filter: "blur(12px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: EASE,
      scale: { duration: 2, ease: EASE },
    },
  },
};

const statVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const About = () => {
  return (
    <section className="section relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-[#E0A526]/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/10 blur-[120px]"
      />

      <div className="content-wrap relative grid grid-cols-1 items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={imageVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-border shadow-[0_20px_60px_-20px_rgba(74,46,32,0.35)]"
        >
          <Image
            src="https://www.escoffier.edu/wp-content/uploads/2021/08/Confident-smiling-female-chef-holding-two-plates-cooked-food-in-kitchen.jpeg"
            alt="Chef tending to a wood-fired tandoor oven in the kitchen"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#E0A526]/25 blur-3xl"
          />
        </motion.div>

        <motion.div
          variants={contentContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="max-w-[52ch]"
        >
          <motion.div
            variants={contentItem}
            className="mb-4 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-[#E0A526]" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E0A526] sm:text-xs">
              Our Story
            </span>
          </motion.div>

          <motion.h2
            variants={contentItem}
            className="text-3xl sm:text-4xl lg:text-5xl"
          >
            A kitchen that{" "}
            <span className="relative inline-block text-primary">
              never rushes
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
            </span>{" "}
            a curry
          </motion.h2>

          <motion.p
            variants={contentItem}
            className="mt-5 text-muted-foreground"
          >
            Master Table began as a single tandoor oven in a Lucknow courtyard.
            Three generations later, the recipes haven&apos;t changed &mdash;
            just the number of tables we set. Every spice is ground fresh each
            morning, every gravy is built the slow way, and every dish leaves
            the kitchen the way it would have left our grandmother&apos;s.
          </motion.p>

          <motion.div
            variants={contentContainer}
            className="mt-8 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-6"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={statVariant}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.3, ease: EASE },
                }}
              >
                <p className="font-heading text-2xl font-semibold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
