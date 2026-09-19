import type { LucideIcon } from "lucide-react";

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";
export type ProductStatus = "Active" | "Low stock" | "Out of stock" | "Draft";
export type CustomerTier = "Regular" | "Silver" | "Gold" | "VIP";
export type OrderChannel = "Dine-in" | "Delivery" | "Pickup";

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type Order = {
  id: string;
  customer: string;
  channel: OrderChannel;
  table: string | null;
  status: OrderStatus;
  payment: string;
  items: string[];
  total: number;
  time: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  emoji: string;
  status: ProductStatus;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
  orders: number;
  spent: number;
  tier: CustomerTier;
  lastVisit: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  items: number;
  revenue: number;
  share: number;
};

export type Reservation = {
  id: string;
  time: string;
  name: string;
  guests: number;
  table: string;
};

export type ActivityItem = {
  id: string;
  text: string;
  tone: "gold" | "warning" | "success" | "danger";
  time: string;
};

export type Report = {
  id: string;
  name: string;
  desc: string;
  range: string;
  format: string;
  size: string;
  updated: string;
};

export type DashboardSummary = {
  revenue: { value: number; delta: string; trend: "up" | "down" };
  orders: { value: number; delta: string; trend: "up" | "down" };
  customers: {
    value: number;
    delta: string;
    trend: "up" | "down";
    newThisMonth: number;
  };
  products: { value: number; lowStock: number };
};

export type RevenueSeries = {
  data: number[];
  compare: number[];
  labels: string[];
  total: number;
  delta: string;
};

export type RestaurantSettings = {
  id?: string;
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  opensAt: string;
  closesAt: string;
  currency: string;
  serviceCharge: number;
};
