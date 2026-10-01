"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AuthContextValue,
  AuthStatus,
  AuthUser,
} from "@/types/auth.types";
import { fetchCurrentUser, logoutCurrentUser } from "@/lib/auth-client";

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
};

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [status, setStatus] = useState<AuthStatus>(
    initialUser ? "authenticated" : "loading"
  );

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    const fresh = await fetchCurrentUser();
    setUser(fresh);
    setStatus(fresh ? "authenticated" : "unauthenticated");
    return fresh;
  }, []);

  useEffect(() => {
    if (initialUser) return;
    let cancelled = false;

    (async () => {
      const fresh = await fetchCurrentUser();
      if (cancelled) return;
      setUser(fresh);
      setStatus(fresh ? "authenticated" : "unauthenticated");
    })();

    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  const logout = useCallback(async () => {
    await logoutCurrentUser();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAdmin: user?.role === "admin",
      refresh,
      logout,
    }),
    [user, status, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

export function useUser(): AuthUser | null {
  return useAuth().user;
}

export function useIsAdmin(): boolean {
  return useAuth().isAdmin;
}