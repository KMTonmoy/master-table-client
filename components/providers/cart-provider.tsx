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

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type AddressInput = Omit<Address, "id"> & { isDefault?: boolean };

type CartContextValue = {
  cart: CartResponse;
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
  authChecked: boolean;
  addresses: Address[];
  addressesLoading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  addAddress: (data: AddressInput) => Promise<Address>;
  refreshAddresses: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const extractError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as
      | {
          error?: string;
          message?: string;
          errors?: { path: string; message: string }[];
        }
      | undefined;
    if (body?.errors?.length) {
      return body.errors.map((e) => `${e.path}: ${e.message}`).join(", ");
    }
    return body?.error || body?.message || err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartResponse>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
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
        const { data } = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });
        if (cancelled) return;
        const payload = unwrap<{ user?: AuthUser }>(data);
        setUser(payload?.user ?? null);
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
      const { data } = await axios.get(`${API_URL}/api/cart`, {
        withCredentials: true,
      });
      if (!mountedRef.current) return;
      setCart(unwrap<CartResponse>(data) ?? EMPTY_CART);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(extractError(err, "Failed to load your cart"));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user]);

  const refreshAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }
    setAddressesLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/users/me/addresses`, {
        withCredentials: true,
      });
      const payload = unwrap<{ addresses?: Address[] }>(data);
      setAddresses(payload?.addresses ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authChecked) return;
    void refresh();
  }, [authChecked, refresh]);

  useEffect(() => {
    if (!authChecked) return;
    void refreshAddresses();
  }, [authChecked, refreshAddresses]);

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
    try {
      const { data } = await axios.post(
        `${API_URL}/api/cart/items`,
        { productId, quantity },
        { withCredentials: true },
      );
      const next = unwrap<CartResponse>(data);
      if (mountedRef.current) {
        setCart(next ?? EMPTY_CART);
        setError(null);
      }
    } catch (err) {
      throw new Error(extractError(err, "Failed to add to cart"));
    }
  }, []);

  const update = useCallback(async (productId: string, quantity: number) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/cart/items/${encodeURIComponent(productId)}`,
        { quantity },
        { withCredentials: true },
      );
      const next = unwrap<CartResponse>(data);
      if (mountedRef.current) {
        setCart(next ?? EMPTY_CART);
        setError(null);
      }
    } catch (err) {
      throw new Error(extractError(err, "Failed to update cart"));
    }
  }, []);

  const remove = useCallback(async (productId: string) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/cart/items/${encodeURIComponent(productId)}`,
        { quantity: 0 },
        { withCredentials: true },
      );
      const next = unwrap<CartResponse>(data);
      if (mountedRef.current) {
        setCart(next ?? EMPTY_CART);
        setError(null);
      }
    } catch (err) {
      throw new Error(extractError(err, "Failed to remove item"));
    }
  }, []);

  const clear = useCallback(async () => {
    try {
      const { data } = await axios.delete(`${API_URL}/api/cart`, {
        withCredentials: true,
      });
      const next = unwrap<CartResponse>(data);
      if (mountedRef.current) {
        setCart(next ?? EMPTY_CART);
        setError(null);
      }
    } catch (err) {
      throw new Error(extractError(err, "Failed to clear cart"));
    }
  }, []);

  const addAddress = useCallback(async (input: AddressInput) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/users/me/addresses`,
        input,
        { withCredentials: true },
      );
      const payload = unwrap<{ address: Address }>(data);
      const created = payload?.address;
      if (!created) throw new Error("Failed to save address");
      setAddresses((prev) => [...prev, created]);
      return created;
    } catch (err) {
      throw new Error(extractError(err, "Failed to save address"));
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      error,
      user,
      authChecked,
      addresses,
      addressesLoading,
      refresh,
      add,
      update,
      remove,
      clear,
      addAddress,
      refreshAddresses,
    }),
    [
      cart,
      loading,
      error,
      user,
      authChecked,
      addresses,
      addressesLoading,
      refresh,
      add,
      update,
      remove,
      clear,
      addAddress,
      refreshAddresses,
    ],
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