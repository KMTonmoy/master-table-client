"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LogOut } from "lucide-react";
import type { SafeUser } from "@/types/dashboard.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type AdminGuardProps = {
  children: React.ReactNode;
};

const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<{ success: boolean; user: SafeUser }>(
          `${API_URL}/api/auth/me`,
          { withCredentials: true },
        );
        if (cancelled) return;
        if (!data?.user || data.user.role !== "admin") {
          setBlocked(true);
        } else {
          setUser(data.user);
        }
      } catch {
        if (!cancelled) setBlocked(true);
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {}
    router.replace("/");
  };

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (blocked) {
    return (
      <>
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-background/60 backdrop-blur-sm"
        />
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-guard-title"
            className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                <Lock className="h-6 w-6" />
              </span>
              <h2
                id="admin-guard-title"
                className="mt-5 font-heading text-2xl font-bold text-foreground"
              >
                Admin access only
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Your account doesn&apos;t have permission to view the dashboard.
                Please sign out and try again with an admin account.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-[#3B2416] transition-colors hover:bg-primary/90"
              >
                <LogOut className="h-4 w-4" />
                Log out and go home
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
