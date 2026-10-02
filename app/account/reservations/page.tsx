"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  PartyPopper,
  Phone,
  Sparkles,
  Users,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type ReservationStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed";

type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  notes?: string;
  status: ReservationStatus;
  table?: string | null;
  createdAt?: string;
};

type FilterTab = "All" | ReservationStatus;

const FILTERS: FilterTab[] = [
  "All",
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
];

const STATUS_STYLES: Record<
  ReservationStatus,
  {
    chip: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  Confirmed: {
    chip:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: Check,
    label: "Confirmed",
  },
  Pending: {
    chip:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    icon: Clock,
    label: "Pending",
  },
  Completed: {
    chip: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dot: "bg-sky-500",
    icon: Utensils,
    label: "Completed",
  },
  Cancelled: {
    chip: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    icon: XCircle,
    label: "Cancelled",
  },
};

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

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isUpcoming = (r: Reservation) => {
  if (!r.date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(r.date);
  return d >= today && r.status !== "Cancelled";
};

const ReservationsPage = () => {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<Reservation[]>(
          `${API_URL}/reservations/my-reservations`,
          { withCredentials: true }
        );
        if (cancelled) return;
        setReservations(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (
          axios.isAxiosError(err) &&
          (err.response?.status === 401 || err.response?.status === 403)
        ) {
          router.replace("/");
          return;
        }
        setError(extractError(err, "Failed to load your reservations"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? reservations
        : reservations.filter((r) => r.status === filter),
    [reservations, filter]
  );

  const upcoming = useMemo(() => filtered.filter(isUpcoming), [filtered]);
  const past = useMemo(() => filtered.filter((r) => !isUpcoming(r)), [filtered]);

  const countBy = (tab: FilterTab) =>
    tab === "All"
      ? reservations.length
      : reservations.filter((r) => r.status === tab).length;

  const stats = useMemo(() => {
    const total = reservations.length;
    const upcomingCount = reservations.filter(isUpcoming).length;
    const guests = reservations
      .filter(isUpcoming)
      .reduce((sum, r) => sum + (r.guests || 0), 0);
    const next = reservations
      .filter(isUpcoming)
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || "00:00"}`);
        const db = new Date(`${b.date}T${b.time || "00:00"}`);
        return da.getTime() - db.getTime();
      })[0];
    return { total, upcomingCount, guests, next };
  }, [reservations]);

  const canCancel = (r: Reservation) =>
    r.status === "Confirmed" || r.status === "Pending";

  const handleCancel = async (reservation: Reservation) => {
    if (!canCancel(reservation)) return;
    if (
      !window.confirm(
        `Cancel your reservation on ${formatDate(reservation.date)}?`
      )
    ) {
      return;
    }

    setBusyId(reservation.id);
    setCancelError(null);
    try {
      await axios.patch(
        `${API_URL}/reservations/${encodeURIComponent(reservation.id)}/cancel`,
        {},
        { withCredentials: true }
      );
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id
            ? { ...r, status: "Cancelled" as ReservationStatus }
            : r
        )
      );
    } catch (err) {
      setCancelError(extractError(err, "Failed to cancel reservation"));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <CalendarCheck className="h-3.5 w-3.5" />
            My reservations
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Your reservations
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Every table you have booked — upcoming and past.
          </p>
        </div>

        <Link
          href="/reservations"
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <Calendar className="h-4 w-4" />
          Book a table
        </Link>
      </motion.header>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total bookings"
          value={String(stats.total)}
          icon={CalendarCheck}
          tone="primary"
        />
        <StatCard
          label="Upcoming"
          value={String(stats.upcomingCount)}
          icon={Calendar}
          tone="emerald"
        />
        <StatCard
          label="Guests booked"
          value={String(stats.guests)}
          icon={Users}
          tone="sky"
        />
      </motion.div>

      {stats.next && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mt-6 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-5 sm:p-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-[#2B1B10] shadow-lg">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Your next reservation
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground">
                {formatDate(stats.next.date)} · {stats.next.time}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {stats.next.guests} guest
                {stats.next.guests === 1 ? "" : "s"}
                {stats.next.occasion ? ` · ${stats.next.occasion}` : ""}
                {stats.next.table ? ` · Table ${stats.next.table}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandedId(stats.next!.id)}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-primary/40 bg-background/60 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              View details
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <AnimatePresence>
        {cancelError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{cancelError}</span>
              <button
                type="button"
                onClick={() => setCancelError(null)}
                aria-label="Dismiss error"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/70 p-3 sm:p-4">
          {FILTERS.map((tab) => {
            const active = filter === tab;
            const count = countBy(tab);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
                  active
                    ? "text-[#2B1B10]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="reservations-filter-pill"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 520, damping: 38 }
                    }
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {tab}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-[#2B1B10]/15 text-[#2B1B10]"
                        : "bg-foreground/10 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            title="No reservations yet"
            hint="When you book a table, it will show up here."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`No ${filter.toLowerCase()} reservations`}
            hint="Try a different filter to see more."
          />
        ) : (
          <div className="divide-y divide-border/70">
            {upcoming.length > 0 && (
              <section className="px-3 py-4 sm:px-5 sm:py-5">
                <SectionHeader
                  title="Upcoming"
                  count={upcoming.length}
                  icon={Calendar}
                />
                <ul className="mt-4 space-y-3">
                  {upcoming.map((r, i) => (
                    <ReservationRow
                      key={r.id}
                      reservation={r}
                      index={i}
                      reduce={reduce}
                      expanded={expandedId === r.id}
                      busy={busyId === r.id}
                      onToggle={() =>
                        setExpandedId(expandedId === r.id ? null : r.id)
                      }
                      onCancel={() => handleCancel(r)}
                      canCancel={canCancel(r)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {past.length > 0 && (
              <section className="px-3 py-4 sm:px-5 sm:py-5">
                <SectionHeader
                  title="Past & cancelled"
                  count={past.length}
                  icon={Clock}
                />
                <ul className="mt-4 space-y-3">
                  {past.map((r, i) => (
                    <ReservationRow
                      key={r.id}
                      reservation={r}
                      index={i}
                      reduce={reduce}
                      expanded={expandedId === r.id}
                      busy={busyId === r.id}
                      onToggle={() =>
                        setExpandedId(expandedId === r.id ? null : r.id)
                      }
                      onCancel={() => handleCancel(r)}
                      canCancel={canCancel(r)}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div className="border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
          Showing {filtered.length} of {reservations.length} reservations
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "emerald" | "sky";
}) => {
  const toneClasses = {
    primary: {
      bg: "bg-primary/15",
      text: "text-primary",
      glow: "bg-primary/20",
    },
    emerald: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-500",
      glow: "bg-emerald-500/20",
    },
    sky: {
      bg: "bg-sky-500/15",
      text: "text-sky-500",
      glow: "bg-sky-500/20",
    },
  }[tone];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl",
          toneClasses.glow
        )}
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            toneClasses.bg,
            toneClasses.text
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  title,
  count,
  icon: Icon,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-center gap-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
      {title}
    </h2>
    <span className="text-xs text-muted-foreground">
      · {count} reservation{count === 1 ? "" : "s"}
    </span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
      <CalendarCheck className="h-7 w-7" />
    </span>
    <div>
      <p className="font-heading text-xl font-semibold text-foreground">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
    <Link
      href="/reservations"
      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md"
    >
      Book a table
    </Link>
  </div>
);

const ReservationRow = ({
  reservation,
  index,
  reduce,
  expanded,
  busy,
  onToggle,
  onCancel,
  canCancel,
}: {
  reservation: Reservation;
  index: number;
  reduce: boolean | null;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onCancel: () => void;
  canCancel: boolean;
}) => {
  const style = STATUS_STYLES[reservation.status];
  const StatusIcon = style.icon;
  const cancelled = reservation.status === "Cancelled";

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      className={cn(
        "group overflow-hidden rounded-2xl border bg-background/40 transition-colors",
        cancelled
          ? "border-border/60 opacity-75"
          : "border-border/70 hover:border-primary/40"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border",
              style.chip
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {new Date(reservation.date)
                .toLocaleString("en-US", { month: "short" })
                .toUpperCase()}
            </span>
            <span className="font-heading text-xl font-bold leading-none">
              {new Date(reservation.date).getDate()}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-heading text-base font-semibold text-foreground">
                {formatDate(reservation.date)}
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  style.chip
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {style.label}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {reservation.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {reservation.guests} guest
                {reservation.guests === 1 ? "" : "s"}
              </span>
              {reservation.table && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Table {reservation.table}
                </span>
              )}
              {reservation.occasion && (
                <span className="inline-flex items-center gap-1">
                  <PartyPopper className="h-3 w-3" />
                  {reservation.occasion}
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60 bg-foreground/[0.02]"
          >
            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Guest
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="truncate font-medium text-foreground">
                      {reservation.name}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium text-foreground">
                      {reservation.email}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <Phone className="h-3 w-3" />
                      {reservation.phone}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Details
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium text-foreground">
                      {formatDate(reservation.date)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Time</dt>
                    <dd className="font-medium text-foreground">
                      {reservation.time}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Guests</dt>
                    <dd className="font-medium text-foreground">
                      {reservation.guests}
                    </dd>
                  </div>
                  {reservation.table && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Table</dt>
                      <dd className="font-medium text-foreground">
                        {reservation.table}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {reservation.notes && (
              <div className="px-4 pb-4 sm:px-5">
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Notes: </span>
                  {reservation.notes}
                </div>
              </div>
            )}

            {canCancel && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="inline-flex h-9 items-center gap-2 rounded-2xl border border-destructive/40 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" />
                      Cancel reservation
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

export default ReservationsPage;