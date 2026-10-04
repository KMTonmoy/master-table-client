"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Sparkles, MessageCircle } from "lucide-react";
import ContactFormComponent from "@/components/Contact/contact.form";
import ContactInfo from "@/components/Contact/contact.info";
import ContactConfirmation from "@/components/Contact/contact.confirmation";
import {
  INITIAL_CONTACT,
  type ContactForm,
} from "@/types/contact.types";

const EASE = [0.22, 1, 0.36, 1] as const;

const headerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const gridReveal: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: EASE },
  },
};

const gridChild: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const Contact = () => {
  const [form, setForm] = useState<ContactForm>(INITIAL_CONTACT);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const reduceMotion = useReducedMotion();

  const update = <K extends keyof ContactForm>(
    key: K,
    value: ContactForm[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    console.log("[Contact] Submit:", form);

    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 900);
  };

  const resetForm = () => {
    setSent(false);
    setForm(INITIAL_CONTACT);
  };

  return (
    <section className="section relative overflow-hidden">
      {/* Pulsing gold ambient glows */}
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#E0A526]/15 blur-[120px]"
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
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#C78E1E]/15 blur-[130px]"
      />
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }
        }
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E0A526]/8 blur-[140px]"
      />

      <div className="content-wrap relative px-5 py-10">
        {/* ───────── HEADER ───────── */}
        <motion.header
          variants={headerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            variants={headerItem}
            className="inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E0A526]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get in touch
          </motion.div>

          <motion.h1
            variants={headerItem}
            className="mt-5 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
          >
            We&apos;d love to{" "}
            <span className="relative inline-block text-[#E0A526]">
              hear from you
              <motion.span
                aria-hidden
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.6 }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={headerItem}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground"
          >
            Questions, feedback, or just want to say hello? Drop us a line
            and we&apos;ll get back to you.
          </motion.p>

          {/* Decorative ornament */}
          <motion.div
            variants={headerItem}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#E0A526]/60" />
            <motion.span
              animate={
                reduceMotion
                  ? undefined
                  : { rotate: [45, 45, 45], scale: [1, 1.15, 1] }
              }
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span className="h-2.5 w-2.5 rotate-45 rounded-[3px] bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_0_0_4px_var(--background),0_0_16px_rgba(224,165,38,0.5)]" />
            </motion.span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#E0A526]/60" />
          </motion.div>
        </motion.header>

        {/* ───────── FORM / CONFIRMATION ───────── */}
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              variants={gridReveal}
              initial={reduceMotion ? false : "hidden"}
              animate="show"
              exit="exit"
              className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-10"
            >
              <motion.div variants={gridChild} className="lg:col-span-3">
                <ContactFormComponent
                  form={form}
                  update={update}
                  onSubmit={handleSubmit}
                  canSubmit={canSubmit}
                  submitting={submitting}
                />
              </motion.div>

              <motion.div variants={gridChild} className="lg:col-span-2">
                <ContactInfo />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -20, scale: 0.96, filter: "blur(8px)" }
              }
              transition={{ duration: 0.7, ease: EASE }}
            >
              <ContactConfirmation form={form} onReset={resetForm} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative bottom accent */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-16 flex max-w-md items-center gap-3"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E0A526]/40" />
          <MessageCircle className="h-4 w-4 text-[#E0A526]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E0A526]/40" />
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;