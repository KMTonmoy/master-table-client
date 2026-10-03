"use client";

import { motion, type Variants } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  ornament?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SOFT_EASE = [0.65, 0, 0.35, 1] as const;

const GOLD = "#E0A526";
const GOLD_DEEP = "#C78E1E";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const lineVariant: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: EASE },
  },
};

const ornamentVariant: Variants = {
  hidden: { scale: 0, rotate: -90, opacity: 0, filter: "blur(6px)" },
  show: {
    scale: 1,
    rotate: 45,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 20,
      mass: 0.8,
    },
  },
};

const sideDiamondVariant = (delay: number): Variants => ({
  hidden: { scale: 0, rotate: -90, opacity: 0 },
  show: {
    scale: 1,
    rotate: 45,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 18,
      mass: 0.6,
      delay,
    },
  },
});

const glowVariant: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.6, ease: EASE, delay: 0.3 },
  },
};

export default function Divider({ className, ornament = true }: DividerProps) {
  if (!ornament) {
    return <Separator className={cn("my-8", className)} />;
  }

  return (
    <motion.div
      role="separator"
      aria-orientation="horizontal"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.5 }}
      className={cn(
        "relative mx-auto flex w-full items-center justify-center py-14",
        className,
      )}
    >
      <motion.span
        aria-hidden
        variants={glowVariant}
        className="pointer-events-none absolute h-44 w-44 rounded-full bg-[#E0A526]/20 blur-[90px] will-change-transform"
      />
      <motion.span
        aria-hidden
        variants={{
          hidden: { opacity: 0, scale: 0.7 },
          show: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1.8, ease: EASE, delay: 0.45 },
          },
        }}
        className="pointer-events-none absolute h-28 w-28 rounded-full bg-[#C78E1E]/25 blur-[70px] will-change-transform"
      />

      <div className="relative h-px flex-1 overflow-hidden">
        <motion.div
          variants={lineVariant}
          style={{ transformOrigin: "right center" }}
          className="h-full w-full bg-gradient-to-l from-transparent via-border to-[#E0A526]/60 will-change-transform"
        />
        <motion.span
          aria-hidden
          initial={{ x: "-130%" }}
          whileInView={{ x: "230%" }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.8, ease: SOFT_EASE, delay: 0.6 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#E0A526] to-transparent will-change-transform"
        />
      </div>

      <span className="relative mx-5 flex items-center gap-3.5">
        <motion.span
          variants={sideDiamondVariant(0.15)}
          className="h-1.5 w-1.5 rounded-[2px] bg-[#E0A526]/70 will-change-transform"
        />

        <span className="relative flex items-center justify-center">
          <motion.span
            aria-hidden
            animate={{
              scale: [1, 2.3, 2.3],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2.8,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1.6,
            }}
            className="absolute inset-0 rounded-full border border-[#E0A526] will-change-transform"
          />

          <motion.span
            aria-hidden
            animate={{
              scale: [1, 1.7, 1.7],
              opacity: [0.3, 0, 0],
            }}
            transition={{
              duration: 2.8,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1.6,
              delay: 0.35,
            }}
            className="absolute inset-0 rounded-full border border-[#E0A526]/60 will-change-transform"
          />

          <motion.span
            aria-hidden
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="absolute -inset-3 rounded-full bg-[#E0A526]/35 blur-md will-change-transform"
          />

          <motion.span
            variants={ornamentVariant}
            className="relative h-3 w-3 rounded-[3px] bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_0_0_4px_var(--background),0_0_24px_rgba(224,165,38,0.55)] will-change-transform"
          />

          <motion.span
            aria-hidden
            variants={{
              hidden: { scale: 0, rotate: 45, opacity: 0 },
              show: {
                scale: 1,
                rotate: 45,
                opacity: 1,
                transition: {
                  duration: 1,
                  ease: EASE,
                  delay: 0.3,
                },
              },
            }}
            className="absolute h-5 w-5 rounded-[4px] border border-[#E0A526]/45 will-change-transform"
          />

          <motion.span
            aria-hidden
            variants={{
              hidden: { scale: 0.8, rotate: 45, opacity: 0 },
              show: {
                scale: 1,
                rotate: 45,
                opacity: 0.6,
                transition: {
                  duration: 1.4,
                  ease: EASE,
                  delay: 0.55,
                },
              },
            }}
            className="absolute h-7 w-7 rounded-[5px] border border-[#E0A526]/25 will-change-transform"
          />
        </span>

        <motion.span
          variants={sideDiamondVariant(0.22)}
          className="h-1.5 w-1.5 rounded-[2px] bg-[#E0A526]/70 will-change-transform"
        />
      </span>

      <div className="relative h-px flex-1 overflow-hidden">
        <motion.div
          variants={lineVariant}
          style={{ transformOrigin: "left center" }}
          className="h-full w-full bg-gradient-to-r from-transparent via-border to-[#E0A526]/60 will-change-transform"
        />
        <motion.span
          aria-hidden
          initial={{ x: "230%" }}
          whileInView={{ x: "-130%" }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.8, ease: SOFT_EASE, delay: 0.6 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-l from-transparent via-[#E0A526] to-transparent will-change-transform"
        />
      </div>
    </motion.div>
  );
}