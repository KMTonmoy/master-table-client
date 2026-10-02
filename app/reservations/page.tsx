"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Check, X } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import ReservationFormComponent from "@/components/Reservations/reservation.form";
import ReservationSummary from "@/components/Reservations/reservation.summary";
import { INITIAL_FORM, ReservationForm } from "@/types/reservation.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const extractError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      fallback
    );
  }
  return err instanceof Error ? err.message : fallback;
};

const ReservationsPage = () => {
  const [form, setForm] = useState<ReservationForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ReservationForm>(
    key: K,
    value: ReservationForm[K]
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
    setError(null);

    try {
      await axios.post(
        `${API_URL}/api/reservations`,
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          date: form.date,
          time: form.time,
          guests: Number(form.guests) || 1,
          occasion: form.occasion ?? "",
          notes: form.notes ?? "",
        },
        { withCredentials: true }
      );

      setSubmitted(true);
    } catch (err) {
      setError(extractError(err, "Could not create your reservation"));
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setSubmitted(false);
    setForm(INITIAL_FORM);
    setError(null);
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 lg:grid-cols-5 lg:gap-10"
        >
          {error && (
            <div className="lg:col-span-5 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <ReservationFormComponent
            form={form}
            update={update}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
            submitting={submitting}
          />
          <ReservationSummary form={form} />
        </motion.div>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Reservation confirmed"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="
                relative w-full max-w-md overflow-hidden rounded-3xl
                border border-emerald-400/50
                bg-emerald-500/20
                shadow-xl backdrop-blur-2xl backdrop-saturate-150
                dark:border-emerald-400/40 dark:bg-emerald-500/15
              "
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/30 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl"
              />

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-emerald-900/70 transition-colors hover:bg-emerald-500/20 hover:text-emerald-950 dark:text-emerald-50/80 dark:hover:text-emerald-50"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-6 text-center sm:p-8">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-900 ring-1 ring-emerald-400/50 dark:text-emerald-100">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </span>

                <h2 className="mt-5 font-heading text-2xl font-bold text-emerald-950 dark:text-emerald-50">
                  Reservation confirmed
                </h2>
                <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-100/85">
                  Thanks {form.name.split(" ")[0] || "friend"} — we&apos;ve
                  saved your table.
                </p>

                <div className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-4 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-900/80 dark:text-emerald-100/80">
                    <CalendarCheck className="h-3 w-3" />
                    Your booking
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-emerald-900/70 dark:text-emerald-100/75">
                        Date
                      </span>
                      <span className="font-medium text-emerald-950 dark:text-emerald-50">
                        {form.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-emerald-900/70 dark:text-emerald-100/75">
                        Time
                      </span>
                      <span className="font-medium text-emerald-950 dark:text-emerald-50">
                        {form.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-emerald-900/70 dark:text-emerald-100/75">
                        Guests
                      </span>
                      <span className="font-medium text-emerald-950 dark:text-emerald-50">
                        {form.guests}
                      </span>
                    </div>
                    {form.occasion && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-emerald-900/70 dark:text-emerald-100/75">
                          Occasion
                        </span>
                        <span className="font-medium text-emerald-950 dark:text-emerald-50">
                          {form.occasion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/account/reservations"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-all hover:bg-emerald-600/90 hover:shadow-md"
                  >
                    View bookings
                  </Link>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-emerald-500/50 bg-emerald-500/15 px-5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-500/25 dark:text-emerald-50"
                  >
                    Book another
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReservationsPage;