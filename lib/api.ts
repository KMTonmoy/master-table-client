import type {
  ActivityItem,
  Category,
  Customer,
  DashboardSummary,
  Order,
  Product,
  Report,
  Reservation,
  RestaurantSettings,
  RevenueSeries,
} from "@/types/dashboard.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function qs(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (!entries.length) return "";
  return `?${new URLSearchParams(entries as [string, string][]).toString()}`;
}

export type ProductPayload = {
  name: string;
  description?: string;
  category: string;
  price: number;
  stock?: number;
  sold?: number;
  rating?: number;
  emoji?: string;
  status?: string;
  images?: string[];
  ingredients?: string[];
  diet?: string;
  cuisine?: string;
  spiceLevel?: number;
  prepTime?: number;
  calories?: number;
  tags?: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
};

export type Banner = {
  _id: string;
  url: string;
  heading: string;
  description: string;
  timestamp?: number;
};

export type BannerPayload = {
  url: string;
  heading: string;
  description: string;
};

export type Payment = {
  _id?: string;
  email: string;
  amount: number;
  currency?: string;
  transactionId?: string;
  items?: string[];
  date?: string;
  status?: string;
};

export type AppUser = {
  _id?: string;
  email: string;
  name?: string;
  displayName?: string;
  role?: string;
  status?: string;
  timestamp?: number;
};

export type TopDish = {
  name: string;
  emoji: string;
  sold: number;
  share: number;
};

export type TrafficSegment = {
  name: string;
  value: number;
  color: string;
};

export type FunnelStep = {
  label: string;
  value: number;
};

export const api = {
  // ---------- DASHBOARD ----------
  dashboardSummary: () => request<DashboardSummary>("/api/dashboard/summary"),
  dashboardRevenue: (range: "7d" | "30d" | "12m") =>
    request<RevenueSeries>(`/api/dashboard/revenue${qs({ range })}`),
  reservations: () => request<Reservation[]>("/api/dashboard/reservations"),
  activity: () => request<ActivityItem[]>("/api/dashboard/activity"),

  // ---------- PRODUCTS (dashboard) ----------
  products: (params?: {
    category?: string;
    status?: string;
    search?: string;
  }) => request<Product[]>(`/api/products${qs(params || {})}`),
  createProduct: (data: ProductPayload) =>
    request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<ProductPayload>) =>
    request(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request(`/api/products/${id}`, { method: "DELETE" }),

  // ---------- PRODUCTS (public menu CRUD) ----------
  menuProducts: (params?: {
    category?: string;
    diet?: string;
    isfeatured?: boolean;
  }) =>
    request<Product[]>(
      `/products${qs({
        category: params?.category,
        diet: params?.diet,
        isfeatured:
          params?.isfeatured === undefined
            ? undefined
            : String(params.isfeatured),
      })}`,
    ),
  menuProduct: (id: string) => request<Product>(`/products/${id}`),
  createMenuProduct: (data: ProductPayload) =>
    request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateMenuProduct: (id: string, data: Partial<ProductPayload>) =>
    request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  replaceMenuProduct: (id: string, data: ProductPayload) =>
    request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMenuProduct: (id: string) =>
    request(`/products/${id}`, { method: "DELETE" }),

  // ---------- CATEGORIES ----------
  categories: () => request<Category[]>("/api/categories"),
  createCategory: (data: Partial<Category>) =>
    request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request(`/api/categories/${id}`, { method: "DELETE" }),

  // ---------- CUSTOMERS ----------
  customers: (params?: { tier?: string; search?: string }) =>
    request<Customer[]>(`/api/customers${qs(params || {})}`),
  createCustomer: (data: Partial<Customer>) =>
    request<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ---------- ORDERS ----------
  orders: (params?: { status?: string; search?: string }) =>
    request<Order[]>(`/api/orders${qs(params || {})}`),
  createOrder: (data: {
    customer: string;
    channel: string;
    table?: string;
    items: string[];
    payment?: string;
  }) =>
    request<{ message: string; orderId: string }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateOrder: (orderId: string, data: Partial<Order>) =>
    request(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // ---------- ANALYTICS ----------
  trafficSources: () => request<TrafficSegment[]>("/api/analytics/traffic"),
  funnel: () => request<FunnelStep[]>("/api/analytics/funnel"),
  weekdayOrders: () => request<number[]>("/api/analytics/weekday-orders"),
  heatmap: () =>
    request<{ hours: number[]; grid: number[][] }>("/api/analytics/heatmap"),
  topDishes: () => request<TopDish[]>("/api/analytics/top-dishes"),

  // ---------- REPORTS ----------
  reports: () => request<Report[]>("/api/reports"),
  generateReport: (name: string, format?: string) =>
    request<Report>("/api/reports/generate", {
      method: "POST",
      body: JSON.stringify({ name, format }),
    }),

  // ---------- SETTINGS ----------
  settings: () => request<RestaurantSettings | null>("/api/settings"),
  updateSettings: (data: Partial<RestaurantSettings>) =>
    request("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // ---------- USERS ----------
  users: () => request<AppUser[]>("/users"),
  user: (email: string) =>
    request<AppUser | null>(`/users/${encodeURIComponent(email)}`),
  updateUserRole: (
    email: string,
    data: { role?: string; userEmail?: string; userName?: string },
  ) =>
    request(`/users/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  upsertUser: (data: AppUser) =>
    request("/user", { method: "PUT", body: JSON.stringify(data) }),

  // ---------- BANNERS ----------
  banners: () => request<Banner[]>("/banners"),
  createBanner: (data: BannerPayload) =>
    request<{ message: string; result: { insertedId: string } }>("/banners", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBanner: (id: string, data: Partial<BannerPayload>) =>
    request(`/banners/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  replaceBanner: (id: string, data: Partial<BannerPayload>) =>
    request(`/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBanner: (id: string) => request(`/banners/${id}`, { method: "DELETE" }),

  // ---------- PAYMENTS ----------
  createPaymentIntent: (price: number) =>
    request<{ clientSecret: string }>("/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ price }),
    }),
  payments: () => request<Payment[]>("/payments"),
  paymentsByEmail: (email: string) =>
    request<Payment[]>(`/payments/${encodeURIComponent(email)}`),
  savePayment: (data: Payment) =>
    request<{ result: { insertedId: string } }>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ---------- AUTH ----------
  logout: () => request<{ success: boolean }>("/logout"),
};
