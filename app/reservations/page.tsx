"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import ReservationFormComponent from "@/components/Reservations/reservation.form";
import ReservationSummary from "@/components/Reservations/reservation.summary";
import ReservationConfirmation from "@/components/Reservations/reservation.confirmation";
import { INITIAL_FORM, ReservationForm } from "@/types/reservation.types";

const ReservationsPage = () => {
  const [form, setForm] = useState<ReservationForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof ReservationForm>(
    key: K,
    value: ReservationForm[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.date !== "" &&
    form.time !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    console.log("[Reservation] Submit:", form);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm(INITIAL_FORM);
  };

  return (
    <section className="section relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl dark:bg-white/10"
      />

      <div className="content-wrap relative px-5 py-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Reservations
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Reserve your table
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Book in seconds. We&apos;ll hold your table for 15 minutes past your
            reservation time — because good things deserve a little patience.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-10"
            >
              <ReservationFormComponent
                form={form}
                update={update}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
                submitting={submitting}
              />
              <ReservationSummary form={form} />
            </motion.div>
          ) : (
            <ReservationConfirmation form={form} onReset={resetForm} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ReservationsPage;
