"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, MapPin } from "lucide-react";
import { ReservationForm } from "@/types/reservation.types";
 
type Props = {
  form: ReservationForm;
  onReset: () => void;
};

const SummaryRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <li className="flex items-center justify-between gap-3">
    <span className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
    </span>
    <span className="truncate text-sm font-semibold text-foreground">
      {value}
    </span>
  </li>
);

const ReservationConfirmation = ({ form, onReset }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-12 max-w-xl"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-8 text-center shadow-[0_30px_80px_-30px_rgba(74,46,32,0.45)] backdrop-blur-2xl backdrop-saturate-150 sm:p-10 dark:border-white/10 dark:bg-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl"
        />

        <div className="relative">
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 14,
              delay: 0.1,
            }}
            className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_rgba(224,165,38,0.6)]"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.span>

          <h2 className="mt-6 font-heading text-3xl font-bold text-foreground">
            Table reserved!
          </h2>
          <p className="mt-3 text-muted-foreground">
            Thanks {form.name.split(" ")[0] || "friend"} — we&apos;ve got you
            down for{" "}
            <span className="font-semibold text-foreground">
              {form.guests} {form.guests === 1 ? "guest" : "guests"}
            </span>{" "}
            on{" "}
            <span className="font-semibold text-foreground">{form.date}</span>{" "}
            at{" "}
            <span className="font-semibold text-foreground">{form.time}</span>.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/60 bg-white/15 p-4 text-left backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <ul className="space-y-3">
              <SummaryRow
                icon={<Mail className="h-4 w-4" />}
                label="Confirmation"
                value={`Sent to ${form.email}`}
              />
              <li className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <SummaryRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value="128 Saffron Lane"
              />
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="
                inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/25 px-7 text-sm font-semibold text-foreground
                backdrop-blur-md transition-all duration-300
                hover:scale-[1.03] hover:bg-white/40 active:scale-[0.98]
                dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20
              "
            >
              Book another table
            </button>
            <Link
              href="/menu"
              className="
                inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground
                shadow-[0_10px_28px_-10px_rgba(224,165,38,0.55)]
                transition-all duration-300
                hover:scale-[1.03] hover:bg-primary/90 active:scale-[0.98]
              "
            >
              Browse menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReservationConfirmation;