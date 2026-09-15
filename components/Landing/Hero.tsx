"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const riseItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
  },
};

const Hero = () => {
  return (
    <section className="section relative w-full overflow-hidden">
      <div className="content-wrap grid w-full grid-cols-1 items-center gap-10 px-5 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Text column */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <motion.h1
            variants={riseItem}
            className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Recipes passed down{" "}
            <span className="text-primary">four generations.</span>
          </motion.h1>

          <motion.p
            variants={riseItem}
            className="mt-5 max-w-[46ch] text-lg text-muted-foreground text-pretty"
          >
            Every curry starts the same way it did in my grandmother&apos;s
            kitchen in Lucknow — slow, patient, and finished by hand over a
            wood-fired tandoor.
          </motion.p>

          <motion.div
            variants={riseItem}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              className="btn-primary h-12 px-8 text-base"
              render={<Link href="/menu" />}
            >
              Order Online
            </Button>
            <Button
              variant="outline"
              className="h-12 border-border px-8 text-base"
              render={<Link href="/reservations" />}
            >
              Reserve a Table
            </Button>
          </motion.div>

          <motion.p
            variants={riseItem}
            className="mt-8 text-sm text-muted-foreground"
          >
            Open daily, noon to 11pm &middot; Dine-in, takeaway &amp; delivery
          </motion.p>
        </motion.div>

        {/* Image column */}
        <motion.div
          variants={imageReveal}
          initial="hidden"
          animate="show"
          className="relative mx-auto w-full max-w-[420px] sm:max-w-[480px] lg:max-w-none"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border shadow-[0_20px_60px_-20px_rgba(74,46,32,0.35)]">
            <Image
              src="https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1200&q=80"
              alt="Hyderabadi biryani served with raita and salad on a copper thali"
              fill
              sizes="(min-width: 1024px) 480px, 80vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Floating chef's-special card */}
          <motion.div
            variants={cardReveal}
            className="absolute -bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-[280px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_12px_30px_-12px_rgba(74,46,32,0.25)] sm:left-4 sm:w-auto sm:translate-x-0"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1671507136750-05ebd0f97843?auto=format&fit=crop&w=200&q=80"
                alt="Paneer curry served with roti"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Chef&apos;s special today
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                Paneer Curry &amp; Roti &mdash; $15
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;