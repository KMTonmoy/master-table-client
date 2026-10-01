export type UserRole = "user" | "admin";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: UserRole;
  provider?: string;
  isVerified?: boolean;
};
export type DashboardNavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export type ProductStatus = "Active" | "Low stock" | "Out of stock" | "Draft";

export type Product = {
  id: string;
  name: string;
  emoji?: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  status: ProductStatus;
  description?: string;
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

export type Category = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  items: number;
  revenue: number;
  share: number;
  image?: string;
};

export type CustomerTier = "VIP" | "Gold" | "Silver" | "Regular";

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

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

export type OrderChannel = "Delivery" | "Pickup" | "Dine-in";

export type Order = {
  id: string;
  customer: string;
  email?: string | null;
  userId?: string | null;
  items: string[];
  total: number;
  status: OrderStatus;
  channel: OrderChannel;
  payment: string;
  table?: string | number | null;
  time: string;
};

export type ReservationStatus =
  | "Confirmed"
  | "Pending"
  | "Cancelled"
  | "Completed";

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  notes?: string;
  status: ReservationStatus;
  table?: string | null;
  createdAt?: string;
};

export type Report = {
  id: string;
  name: string;
  desc: string;
  range: string;
  format: "PDF" | "XLSX" | "CSV";
  size: string;
  updated: string;
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
  updatedAt?: string;
};

export type Trend = "up" | "down";

export type SummaryBlock = {
  value: number;
  delta: string;
  trend: Trend;
};

export type DashboardSummary = {
  revenue: SummaryBlock;
  orders: SummaryBlock;
  customers: SummaryBlock & { newThisMonth: number };
  products: { value: number; lowStock: number };
};

export type RevenueSeries = {
  data: number[];
  compare: number[];
  labels: string[];
  total: number;
  delta: string;
};

export type ActivityTone = "gold" | "warning" | "success" | "danger";

export type ActivityItem = {
  id: string;
  text: string;
  tone: ActivityTone;
  time: string;
};

export type TopDish = {
  name: string;
  image: string;
  sold: number;
  share: number;
};

export type DashboardRange = "7d" | "30d" | "12m";
