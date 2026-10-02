"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import type { AuthUser } from "@/types/auth.types";
import type { CartResponse } from "@/types/cart.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const POLL_MS = 30_000;

const EMPTY_CART: CartResponse = { items: [], count: 0, subtotal: 0 };

type CartContextValue = {
  cart: CartResponse;
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  authChecked: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartResponse>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
          `${API_URL}/api/auth/me`,
          { withCredentials: true }
        );
        if (cancelled) return;
        setUser(data?.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      if (mountedRef.current) {
        setCart(EMPTY_CART);
        setError(null);
        setLoading(false);
      }
      return;
    }

    try {
      const { data } = await axios.get<CartResponse>(`${API_URL}/api/cart`, {
        withCredentials: true,
      });
      if (!mountedRef.current) return;
      setCart(data ?? EMPTY_CART);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(extractError(err, "Failed to load your cart"));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [authChecked, refresh]);

  useEffect(() => {
    if (!user) return;

    const interval = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, refresh]);

  const add = useCallback(async (productId: string, quantity = 1) => {
    const { data } = await axios.post<CartResponse>(
      `${API_URL}/api/cart/items`,
      { productId, quantity },
      { withCredentials: true }
    );
    if (mountedRef.current) {
      setCart(data);
      setError(null);
    }
  }, []);

  const update = useCallback(async (productId: string, quantity: number) => {
    const { data } = await axios.patch<CartResponse>(
      `${API_URL}/api/cart/items/${encodeURIComponent(productId)}`,
      { quantity },
      { withCredentials: true }
    );
    if (mountedRef.current) {
      setCart(data);
      setError(null);
    }
  }, []);

  const remove = useCallback(async (productId: string) => {
    const { data } = await axios.patch<CartResponse>(
      `${API_URL}/api/cart/items/${encodeURIComponent(productId)}`,
      { quantity: 0 },
      { withCredentials: true }
    );
    if (mountedRef.current) {
      setCart(data);
      setError(null);
    }
  }, []);

  const clear = useCallback(async () => {
    const { data } = await axios.delete<CartResponse>(`${API_URL}/api/cart`, {
      withCredentials: true,
    });
    if (mountedRef.current) {
      setCart(data ?? EMPTY_CART);
      setError(null);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      error,
      user,
      authChecked,
      refresh,
      add,
      update,
      remove,
      clear,
    }),
    [
      cart,
      loading,
      error,
      user,
      authChecked,
      refresh,
      add,
      update,
      remove,
      clear,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}