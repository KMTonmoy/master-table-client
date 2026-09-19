import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Small pill shown on the right of the item, e.g. a count */
  badge?: string;
};

export type Trend = "up" | "down";

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

export type Order = {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: OrderStatus;
  channel: "Dine-in" | "Delivery" | "Pickup";
  payment: "Card" | "Cash" | "Wallet";
  time: string;
  table?: string;
};

export type ProductStatus = "Active" | "Low stock" | "Out of stock" | "Draft";

export type Product = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  status: ProductStatus;
};

export type CustomerTier = "Regular" | "Silver" | "Gold" | "VIP";

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
  emoji: string;
  items: number;
  revenue: number;
  share: number;
  description: string;
};
