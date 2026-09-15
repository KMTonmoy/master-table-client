"use client";

import { motion, type Variants } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  ornament?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const lineVariant: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.9, ease: EASE },
  },
};

const diamondVariant: Variants = {
  hidden: { scale: 0, rotate: 0, opacity: 0 },
  show: {
    scale: 1,
    rotate: 45,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: EASE,
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
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
      viewport={{ once: true, amount: 0.6 }}
      className={cn(
        "relative mx-auto flex w-full items-center justify-center py-10",
        className,
      )}
    >
      <motion.span
        aria-hidden
        variants={{
          hidden: { opacity: 0, scale: 0.6 },
          show: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1.2, ease: EASE, delay: 0.3 },
          },
        }}
        className="pointer-events-none absolute h-24 w-24 rounded-full bg-primary/20 blur-2xl"
      />

      <div className="relative h-px flex-1 overflow-hidden">
        <motion.div
          variants={lineVariant}
          style={{ transformOrigin: "right center" }}
          className="h-full w-full bg-gradient-to-l from-transparent via-border to-primary/50"
        />

        <motion.span
          aria-hidden
          initial={{ x: "-120%" }}
          whileInView={{ x: "220%" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.6 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />
      </div>

      <span className="relative mx-4 flex items-center gap-2.5">
        <motion.span
          variants={diamondVariant}
          className="h-1.5 w-1.5 rounded-[2px] bg-primary/60"
        />

        <span className="relative flex items-center justify-center">
          <motion.span
            aria-hidden
            animate={{
              scale: [1, 1.9, 1.9],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2.4,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1.6,
            }}
            className="absolute inset-0 rounded-full border border-primary"
          />

          <motion.span
            aria-hidden
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="absolute -inset-2 rounded-full bg-primary/40 blur-md"
          />
          <motion.span
            variants={diamondVariant}
            className="relative h-2.5 w-2.5 rounded-[3px] bg-primary shadow-[0_0_0_4px_var(--background)]"
          />
        </span>

        <motion.span
          variants={diamondVariant}
          className="h-1.5 w-1.5 rounded-[2px] bg-primary/60"
        />
      </span>

      <div className="relative h-px flex-1 overflow-hidden">
        <motion.div
          variants={lineVariant}
          style={{ transformOrigin: "left center" }}
          className="h-full w-full bg-gradient-to-r from-transparent via-border to-primary/50"
        />

        <motion.span
          aria-hidden
          initial={{ x: "220%" }}
          whileInView={{ x: "-120%" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.6 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-l from-transparent via-primary/70 to-transparent"
        />
      </div>
    </motion.div>
  );
}
