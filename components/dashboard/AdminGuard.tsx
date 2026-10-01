"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { AuthUser } from "@/types/auth.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated"; user: null };

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
          `${API_URL}/api/auth/me`,
          { withCredentials: true }
        );
        if (cancelled) return;
        if (!data?.user || data.user.role !== "admin") {
          setAuth({ status: "unauthenticated", user: null });
        } else {
          setAuth({ status: "authenticated", user: data.user });
        }
      } catch {
        if (!cancelled) {
          setAuth({ status: "unauthenticated", user: null });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace("/");
    }
  }, [auth.status, router]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {}
    router.replace("/");
  };

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return null;
  }

  if (auth.user.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-2xl sm:p-8">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Admin access only
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have permission to view the dashboard.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-[#3B2416] transition-colors hover:bg-primary/90"
          >
            Log out and go home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}