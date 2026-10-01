import axios from "axios";
import type { AuthUser } from "@/types/auth.types";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
      `${API_URL}/api/auth/me`,
      { withCredentials: true },
    );
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function logoutCurrentUser(): Promise<void> {
  try {
    await axios.post(
      `${API_URL}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
  } catch {}
}
