"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  Check,
  X,
  Sparkles,
  Clock,
  Users,
  PartyPopper,
  Mail,
  User,
  Phone,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import ReservationFormComponent from "@/components/Reservations/reservation.form";
import ReservationSummary from "@/components/Reservations/reservation.summary";
import { INITIAL_FORM, ReservationForm } from "@/types/reservation.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

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

const ResevationsPage = () => {
  const [form, setForm] = useState<ReservationForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

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
        { withCredentials: true },
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
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }
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

      <div className="content-wrap relative px-5 py-10">
        <motion.div
          initial={
            reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E0A526]">
            <Sparkles className="h-3.5 w-3.5" />
            Reserve Your Table
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Book an{" "}
            <span className="relative inline-block text-[#E0A526]">
              unforgettable
              <motion.span
                aria-hidden
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.5 }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
              />
            </span>{" "}
            evening
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Tell us when you&apos;re coming — we&apos;ll have the table ready,
            warm, and waiting.
          </p>
        </motion.div>

        <motion.div
          initial={
            reduceMotion ? false : { opacity: 0, y: 30, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="grid gap-8 lg:grid-cols-5 lg:gap-10"
        >
          {error && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="lg:col-span-5 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
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
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={closeModal}
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Reservation confirmed"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 30, scale: 0.94, filter: "blur(10px)" }
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
                  : { opacity: 0, y: -20, scale: 0.94, filter: "blur(10px)" }
              }
              transition={{ duration: 0.5, ease: EASE }}
              className="
                relative w-full max-w-md overflow-hidden rounded-3xl
                border border-[#E0A526]/40
                bg-card/95 shadow-[0_40px_100px_-30px_rgba(74,46,32,0.6)]
                backdrop-blur-2xl backdrop-saturate-150
              "
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526] to-transparent"
              />

              <motion.div
                aria-hidden
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }
                }
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#E0A526]/30 blur-3xl"
              />
              <motion.div
                aria-hidden
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.3, 0.65, 0.3], scale: [1, 1.12, 1] }
                }
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 0.6,
                }}
                className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#C78E1E]/30 blur-3xl"
              />

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#E0A526]/10 hover:text-[#E0A526]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-6 text-center sm:p-8">
                <motion.span
                  initial={reduceMotion ? false : { scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                    delay: 0.15,
                  }}
                  className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] text-white shadow-[0_0_40px_rgba(224,165,38,0.6)]"
                >
                  <motion.span
                    aria-hidden
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: [1, 1.8, 1.8],
                            opacity: [0.6, 0, 0],
                          }
                    }
                    transition={{
                      duration: 2.4,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: 1.4,
                    }}
                    className="absolute inset-0 rounded-full border-2 border-[#E0A526]"
                  />
                  <Check className="relative h-10 w-10" strokeWidth={3} />
                </motion.span>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
                >
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E0A526]">
                    <PartyPopper className="h-3 w-3" />
                    Confirmed
                  </div>

                  <h2 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                    Reservation confirmed
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thanks {form.name.split(" ")[0] || "friend"} — we&apos;ve
                    saved your table.
                  </p>
                </motion.div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
                  className="relative mt-6 overflow-hidden rounded-2xl border border-[#E0A526]/30 bg-[#E0A526]/5 p-4 text-left backdrop-blur-sm"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/50 to-transparent"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#E0A526]">
                    <CalendarCheck className="h-3 w-3" />
                    Your booking
                  </div>

                  <div className="mt-3 space-y-2.5 text-sm">
                    <DetailRow
                      icon={<CalendarCheck className="h-3.5 w-3.5" />}
                      label="Date"
                      value={form.date}
                      delay={0.5}
                    />
                    <DetailRow
                      icon={<Clock className="h-3.5 w-3.5" />}
                      label="Time"
                      value={form.time}
                      delay={0.55}
                    />
                    <DetailRow
                      icon={<Users className="h-3.5 w-3.5" />}
                      label="Guests"
                      value={String(form.guests)}
                      delay={0.6}
                    />
                    {form.occasion && (
                      <DetailRow
                        icon={<Sparkles className="h-3.5 w-3.5" />}
                        label="Occasion"
                        value={form.occasion}
                        delay={0.65}
                      />
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
                  className="mt-6 flex flex-col gap-2 sm:flex-row"
                >
                  <Link
                    href="/account/reservations"
                    className="group/btn relative inline-flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-sm font-semibold text-[#3B2416] shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)] transition-shadow duration-500 hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
                    <span className="relative flex items-center gap-2">
                      View bookings
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#E0A526]/40 bg-white/5 px-5 text-sm font-semibold text-foreground transition-colors hover:border-[#E0A526]/70 hover:bg-[#E0A526]/10"
                  >
                    Book another
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    className="flex items-center justify-between gap-3"
  >
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <span className="text-[#E0A526]">{icon}</span>
      {label}
    </span>
    <span className="font-medium text-foreground">{value}</span>
  </motion.div>
);

export default ResevationsPage;
