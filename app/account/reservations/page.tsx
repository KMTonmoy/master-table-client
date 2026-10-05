"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
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
  process.env.NEXT_PUBLIC_API_URL ?? "https://master-table-server.vercel.app"
).replace(/\/+$/, "");

const EASE = [0.22, 1, 0.36, 1] as const;

const headerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

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
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: Check,
    label: "Confirmed",
  },
  Pending: {
    chip: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    icon: Clock,
    label: "Pending",
  },
  Completed: {
    chip: "bg-[#E0A526]/15 text-[#E0A526] border-[#E0A526]/30",
    dot: "bg-[#E0A526]",
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
          { withCredentials: true },
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
    [reservations, filter],
  );

  const upcoming = useMemo(() => filtered.filter(isUpcoming), [filtered]);
  const past = useMemo(
    () => filtered.filter((r) => !isUpcoming(r)),
    [filtered],
  );

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
    const next = reservations.filter(isUpcoming).sort((a, b) => {
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
        `Cancel your reservation on ${formatDate(reservation.date)}?`,
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
        { withCredentials: true },
      );
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id
            ? { ...r, status: "Cancelled" as ReservationStatus }
            : r,
        ),
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative"
        >
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-[#E0A526]"
          />
          <Loader2 className="h-8 w-8 animate-spin text-[#E0A526]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient gold glows */}
      <motion.div
        aria-hidden
        animate={
          reduce ? undefined : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-[#E0A526]/12 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={
          reduce ? undefined : { opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }
        }
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.5,
        }}
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/12 blur-[120px]"
      />

      {/* HEADER */}
      <motion.header
        variants={headerContainer}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="relative flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <motion.p
            variants={headerItem}
            className="inline-flex items-center gap-2 rounded-full border border-[#E0A526]/30 bg-[#E0A526]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E0A526]"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            My reservations
          </motion.p>
          <motion.h1
            variants={headerItem}
            className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl"
          >
            Your{" "}
            <span className="relative inline-block text-[#E0A526]">
              reservations
              <motion.span
                aria-hidden
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.5 }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
              />
            </span>
          </motion.h1>
          <motion.p
            variants={headerItem}
            className="mt-3 max-w-2xl text-base text-muted-foreground"
          >
            Every table you have booked — upcoming and past.
          </motion.p>
        </div>

        <motion.div variants={headerItem}>
          <Link
            href="/reservations"
            className="
              group/btn relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl
              bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-sm font-semibold text-[#3B2416]
              shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
              transition-shadow duration-300
              hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
            "
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
            <span className="relative flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Book a table
            </span>
          </Link>
        </motion.div>
      </motion.header>

      {/* STATS */}
      <motion.div
        variants={headerContainer}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total bookings"
          value={String(stats.total)}
          icon={CalendarCheck}
          tone="gold"
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

      {/* NEXT RESERVATION HIGHLIGHT */}
      {stats.next && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="relative mt-6 overflow-hidden rounded-3xl border border-[#E0A526]/40 bg-gradient-to-br from-[#E0A526]/20 via-[#E0A526]/5 to-transparent p-5 sm:p-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/70 to-transparent"
          />
          <motion.div
            aria-hidden
            animate={
              reduce
                ? undefined
                : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }
            }
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#E0A526]/25 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
                delay: 0.3,
              }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E0A526] to-[#C78E1E] text-[#3B2416] shadow-[0_0_30px_rgba(224,165,38,0.5)]"
            >
              <Sparkles className="h-6 w-6" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E0A526]">
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
            <motion.button
              type="button"
              onClick={() => setExpandedId(stats.next!.id)}
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#E0A526]/40 bg-background/60 px-4 text-sm font-semibold text-foreground transition-colors hover:border-[#E0A526]/70 hover:bg-[#E0A526]/5"
            >
              View details
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* FETCH ERROR */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCEL ERROR */}
      <AnimatePresence>
        {cancelError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
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

      {/* RESERVATIONS PANEL */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
      >
        {/* Top shine line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
        />

        {/* FILTER TABS */}
        <div className="relative flex flex-wrap items-center gap-1.5 border-b border-border/70 p-3 sm:p-4">
          {FILTERS.map((tab) => {
            const active = filter === tab;
            const count = countBy(tab);
            return (
              <motion.button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                whileHover={!active ? { y: -2 } : undefined}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: EASE }}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-[#3B2416]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] shadow-[0_8px_20px_-8px_rgba(224,165,38,0.6)]"
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {tab}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-black/15 text-[#3B2416]"
                        : "bg-foreground/10 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            title="No reservations yet"
            hint="When you book a table, it will show up here."
            reduce={reduce}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={`No ${filter.toLowerCase()} reservations`}
            hint="Try a different filter to see more."
            reduce={reduce}
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

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "gold" | "emerald" | "sky";
}) => {
  const toneClasses = {
    gold: {
      bg: "bg-[#E0A526]/15",
      text: "text-[#E0A526]",
      glow: "bg-[#E0A526]/20",
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
    <motion.div
      variants={cardReveal}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
      className="
        group relative overflow-hidden rounded-3xl border border-border bg-card/70 p-5 backdrop-blur-xl
        transition-colors duration-500
        hover:border-[#E0A526]/40
      "
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-all duration-700 group-hover:scale-125",
          toneClasses.glow,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/40 to-transparent"
      />
      <div className="relative flex items-center gap-3">
        <motion.span
          whileHover={{ rotate: -6, scale: 1.08 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            toneClasses.bg,
            toneClasses.text,
          )}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
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
    <motion.span
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526]"
    >
      <Icon className="h-4 w-4" />
    </motion.span>
    <h2 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
      {title}
    </h2>
    <span className="text-xs text-muted-foreground">
      · {count} reservation{count === 1 ? "" : "s"}
    </span>
    <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
  </div>
);

const EmptyState = ({
  title,
  hint,
  reduce,
}: {
  title: string;
  hint: string;
  reduce: boolean | null;
}) => (
  <motion.div
    initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(8px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.7, ease: EASE }}
    className="relative flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E0A526]/15 blur-3xl"
    />
    <motion.span
      initial={reduce ? false : { scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 20,
        delay: 0.2,
      }}
      className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#E0A526]/15 text-[#E0A526] shadow-[0_0_30px_rgba(224,165,38,0.3)]"
    >
      <CalendarCheck className="h-7 w-7" />
    </motion.span>
    <div className="relative">
      <p className="font-heading text-xl font-semibold text-foreground">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
    >
      <Link
        href="/reservations"
        className="
          group/btn relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl
          bg-gradient-to-br from-[#E0A526] to-[#C78E1E] px-5 text-sm font-semibold text-[#3B2416]
          shadow-[0_10px_28px_-10px_rgba(224,165,38,0.6)]
          transition-shadow duration-300
          hover:shadow-[0_14px_32px_-10px_rgba(224,165,38,0.75)]
        "
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
        <span className="relative flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Book a table
        </span>
      </Link>
    </motion.div>
  </motion.div>
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
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.5,
        delay: reduce ? 0 : Math.min(index * 0.04, 0.3),
        ease: EASE,
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-background/40 transition-colors duration-500",
        cancelled
          ? "border-border/60 opacity-75"
          : "border-border/70 hover:border-[#E0A526]/40 hover:bg-[#E0A526]/[0.03]",
      )}
    >
      {/* Hover gold glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#E0A526]/0 blur-2xl transition-all duration-500 group-hover:bg-[#E0A526]/20"
      />

      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        whileHover={reduce ? undefined : { y: -2 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="relative flex w-full flex-wrap items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <div className="relative flex min-w-0 items-center gap-4">
          <motion.div
            whileHover={reduce ? undefined : { rotate: -4, scale: 1.06 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border",
              style.chip,
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
          </motion.div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-heading text-base font-semibold text-foreground">
                {formatDate(reservation.date)}
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  style.chip,
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
            expanded && "rotate-180",
          )}
        />
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden border-t border-border/60 bg-foreground/[0.02]"
          >
            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#E0A526]">
                  Guest
                </h4>
                <dl className="space-y-2 text-sm">
                  <DetailRow label="Name" value={reservation.name} />
                  <DetailRow label="Email" value={reservation.email} />
                  <DetailRow
                    label="Phone"
                    value={reservation.phone}
                    icon={<Phone className="h-3 w-3" />}
                  />
                </dl>
              </div>

              <div>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#E0A526]">
                  Details
                </h4>
                <dl className="space-y-2 text-sm">
                  <DetailRow
                    label="Date"
                    value={formatDate(reservation.date)}
                  />
                  <DetailRow label="Time" value={reservation.time} />
                  <DetailRow
                    label="Guests"
                    value={String(reservation.guests)}
                  />
                  {reservation.table && (
                    <DetailRow
                      label="Table"
                      value={String(reservation.table)}
                    />
                  )}
                </dl>
              </div>
            </div>

            {reservation.notes && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
                className="px-4 pb-4 sm:px-5"
              >
                <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Notes: </span>
                  {reservation.notes}
                </div>
              </motion.div>
            )}

            {canCancel && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-4 py-3 sm:px-5">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  whileHover={reduce ? undefined : { scale: 1.03 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.25, ease: EASE }}
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
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, ease: EASE }}
    className="flex items-center justify-between gap-3"
  >
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="inline-flex items-center gap-1.5 truncate font-medium text-foreground">
      {icon}
      {value}
    </dd>
  </motion.div>
);

export default ReservationsPage;
