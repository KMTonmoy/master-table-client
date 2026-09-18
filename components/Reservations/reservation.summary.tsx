"use client";

import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  User,
  Users,
  Utensils,
} from "lucide-react";
import { OCCASIONS, ReservationForm } from "@/types/reservation.types";

type Props = {
  form: ReservationForm;
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

const ReservationSummary = ({ form }: Props) => {
  return (
    <aside className="lg:col-span-2">
      <div className="sticky top-24 space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-6 shadow-[0_25px_70px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-2xl"
          />

          <h3 className="relative font-heading text-lg font-semibold text-foreground">
            Your reservation
          </h3>

          <ul className="relative mt-4 space-y-3 text-sm">
            <SummaryRow
              icon={<User className="h-4 w-4" />}
              label="Name"
              value={form.name || "—"}
            />
            <SummaryRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date"
              value={form.date || "—"}
            />
            <SummaryRow
              icon={<Clock className="h-4 w-4" />}
              label="Time"
              value={form.time}
            />
            <SummaryRow
              icon={<Users className="h-4 w-4" />}
              label="Party"
              value={`${form.guests} ${form.guests === 1 ? "guest" : "guests"}`}
            />
            <SummaryRow
              icon={<Sparkles className="h-4 w-4" />}
              label="Occasion"
              value={
                OCCASIONS.find((o) => o.value === form.occasion)?.label ?? "—"
              }
            />
          </ul>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/15 shadow-[0_20px_55px_-25px_rgba(74,46,32,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
            alt="Master Table dining room"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/40 bg-black/40 p-3 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Master Table
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/90">
              <MapPin className="h-3 w-3" />
              128 Saffron Lane · Old Market District
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/10 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-primary">
            <Utensils className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Good to know
            </span>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>· Tables held 15 minutes past booking time.</li>
            <li>· Parties of 8+ require a quick confirmation call.</li>
            <li>· Free cancellation up to 2 hours before your slot.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default ReservationSummary;
