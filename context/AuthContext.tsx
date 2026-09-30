"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<string>;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.me();
      setUser((res.user as AuthUser) ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const res = await api.me();
        if (ignore) return;
        setUser((res.user as AuthUser) ?? null);
      } catch {
        if (ignore) return;
        setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      const loggedInUser = res.user as AuthUser;
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Login failed"));
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await api.register({ name, email, password });
        const newUser = res.user as AuthUser;
        setUser(newUser);
        return newUser;
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Registration failed"));
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await api.forgotPassword(email);
      return res.message || "Reset link sent if the account exists.";
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Could not send reset link"));
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      const res = await api.resetPassword(token, password);
      return res.message || "Password updated.";
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Could not reset password"));
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = api.googleLoginUrl();
  }, []);

  const loginWithFacebook = useCallback(() => {
    window.location.href = api.facebookLoginUrl();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    loginWithFacebook,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
