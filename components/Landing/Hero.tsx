"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const images = [
  {
    src: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=2400&q=80",
    alt: "Hyderabadi biryani served with raita and salad on a copper thali",
    eyebrow: "Authentic Indian Flavors",
    title: "Hyderabadi Biryani",
    description:
      "Fragrant basmati rice, tender chicken, and aromatic spices slow-cooked to perfection.",
    cta: { label: "Explore Menu", href: "/menu" },
  },
  {
    src: "https://images.unsplash.com/photo-1671507136750-05ebd0f97843?auto=format&fit=crop&w=2400&q=80",
    alt: "Paneer curry served with roti",
    eyebrow: "Authentic Indian Flavors",
    title: "Paneer Butter Masala",
    description:
      "Creamy tomato gravy, soft paneer cubes, and a hint of kasuri methi served with warm roti.",
    cta: { label: "Explore Menu", href: "/menu" },
  },
  {
    src: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=2400&q=80",
    alt: "Indian thali with curries and naan",
    eyebrow: "Authentic Indian Flavors",
    title: "Royal Indian Thali",
    description:
      "A curated platter of curries, dal, naan, and desserts — a complete Indian feast on one plate.",
    cta: { label: "Explore Menu", href: "/menu" },
  },
  {
    src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=2400&q=80",
    alt: "Tandoori chicken with lemon and onions",
    eyebrow: "Authentic Indian Flavors",
    title: "Tandoori Chicken",
    description:
      "Char-grilled chicken marinated in yogurt and spices, served with lemon and fresh onions.",
    cta: { label: "Explore Menu", href: "/menu" },
  },
  {
    src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=2400&q=80",
    alt: "Butter chicken in a bowl",
    eyebrow: "Authentic Indian Flavors",
    title: "Butter Chicken",
    description:
      "Tender chicken simmered in a rich, buttery tomato sauce — a timeless Indian classic.",
    cta: { label: "Explore Menu", href: "/menu" },
  },
];

/* ---------------------------------- */
/*        LUXURY MOTION VARIANTS      */
/* ---------------------------------- */

// Image: soft blur-in + slow Ken Burns zoom for cinematic feel
const imageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "15%" : "-15%",
    opacity: 0,
    scale: 1.15,
    filter: "blur(12px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1.05,
    filter: "blur(0px)",
    transition: {
      x: { type: "spring", stiffness: 220, damping: 32 },
      opacity: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
      scale: { duration: 6, ease: "linear" }, // slow Ken Burns
      filter: { duration: 0.9, ease: "easeOut" },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-15%" : "15%",
    opacity: 0,
    scale: 1.1,
    filter: "blur(10px)",
    transition: {
      x: { type: "spring", stiffness: 220, damping: 32 },
      opacity: { duration: 0.6 },
      filter: { duration: 0.5 },
    },
  }),
};

// Content container: staggered children
const contentContainer: Variants = {
  enter: {},
  center: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.25,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Individual content items: rise + blur + fade
const contentItem: Variants = {
  enter: {
    y: 30,
    opacity: 0,
    filter: "blur(8px)",
  },
  center: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    filter: "blur(6px)",
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

// Gold divider line that draws itself in
const lineVariants: Variants = {
  enter: { scaleX: 0, opacity: 0 },
  center: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.1,
    },
  },
  exit: { scaleX: 0, opacity: 0, transition: { duration: 0.3 } },
};

/* ---------------------------------- */

const Hero = () => {
  const [[index, direction], setState] = useState<[number, number]>([0, 1]);
  const current = images[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setState(([prev]) => [(prev + 1) % images.length, 1]);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i: number) => {
    setState(([prev]) => [i, i > prev ? 1 : -1]);
  };

  return (
    <section className="section relative w-full overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div
          className="
            group
            relative
            aspect-[4/3]
            w-full
            overflow-hidden
            rounded-3xl
            border
            border-border
            shadow-[0_20px_60px_-20px_rgba(74,46,32,0.35)]
            sm:aspect-[16/9]
            lg:aspect-[21/9]
          "
        >
          {/* Background Carousel */}
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={index}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 h-full w-full will-change-transform"
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Cinematic Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
          {/* Vignette for depth */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

          {/* Content Overlay */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="w-full px-6 sm:px-12 lg:px-20">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={contentContainer}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-w-xl"
                >
                  {/* Eyebrow */}
                  <motion.div
                    variants={contentItem}
                    className="mb-5 flex items-center gap-3"
                  >
                    <span className="h-px w-10 bg-[#E0A526]" />
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[#E0A526] sm:text-sm">
                      {current.eyebrow}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    variants={contentItem}
                    className="mb-4 font-heading text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    {current.title}
                  </motion.h1>

                  {/* Gold underline accent */}
                  <motion.div
                    variants={lineVariants}
                    style={{ transformOrigin: "left" }}
                    className="mb-6 h-[2px] w-24 bg-gradient-to-r from-[#E0A526] to-transparent"
                  />

                  {/* Description */}
                  <motion.p
                    variants={contentItem}
                    className="mb-9 max-w-lg font-sans text-base leading-relaxed text-white/80 sm:text-lg"
                  >
                    {current.description}
                  </motion.p>

                  {/* CTA */}
                  <motion.div variants={contentItem}>
                    <Link
                      href={current.cta.href}
                      className="
                        group/btn
                        relative
                        inline-flex
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border-2
                        border-white/90
                        px-9
                        py-3.5
                        font-sans
                        text-sm
                        font-semibold
                        tracking-wide
                        text-white
                        transition-all
                        duration-500
                        hover:border-[#E0A526]
                        hover:text-black
                        sm:text-base
                      "
                    >
                      {/* Sliding gold fill */}
                      <span className="absolute inset-0 -z-0 translate-y-full bg-[#E0A526] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-y-0" />
                      <span className="relative z-10 flex items-center gap-2">
                        {current.cta.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-500 group-hover/btn:translate-x-1"
                        >
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 right-6 z-30 flex gap-2 sm:bottom-10 sm:right-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="group/dot relative h-2 w-6 overflow-hidden rounded-full"
              >
                <span className="absolute inset-0 rounded-full bg-white/25 transition-colors duration-300 group-hover/dot:bg-white/50" />
                {i === index && (
                  <motion.span
                    layoutId="active-dot"
                    className="absolute inset-0 rounded-full bg-[#E0A526] shadow-[0_0_12px_rgba(224,165,38,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
