import type { Category, Customer, Order, Product } from "@/types/dashboard.types";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const revenue12m = [12400, 13800, 12900, 15600, 17200, 16400, 18900, 20300, 19100, 22400, 23800, 24780];
export const revenue12mPrev = [10100, 11200, 11800, 12400, 13900, 14600, 15100, 16800, 16200, 18100, 19400, 21000];

export const revenue30d = [
  620, 710, 680, 790, 860, 1120, 1240, 700, 730, 760, 820, 910, 1180, 1320, 760, 790, 810, 880, 940, 1210, 1390, 820,
  850, 900, 960, 1020, 1300, 1480, 940, 1010,
];
export const days30 = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

export const revenue7d = [880, 940, 1010, 990, 1420, 1690, 1180];

export const ordersByWeekday = [142, 156, 149, 171, 238, 296, 232];

// rows = weekdays, cols = hours 11..22
export const HOURS = ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];
export const heatmap: number[][] = [
  [2, 6, 8, 4, 2, 2, 3, 6, 8, 9, 6, 3],
  [2, 6, 9, 5, 2, 2, 3, 6, 8, 8, 6, 3],
  [3, 6, 8, 5, 2, 2, 3, 7, 8, 9, 6, 3],
  [3, 7, 9, 5, 3, 2, 4, 7, 9, 10, 7, 4],
  [4, 8, 10, 6, 3, 3, 6, 10, 13, 15, 12, 7],
  [6, 11, 14, 9, 5, 5, 8, 13, 17, 19, 15, 9],
  [6, 12, 15, 10, 5, 4, 6, 10, 13, 14, 10, 5],
];

export const categories: Category[] = [
  { id: "c1", name: "Wood-fired pizza", emoji: "🍕", items: 14, revenue: 8420, share: 34, description: "Neapolitan dough, 90-second bake" },
  { id: "c2", name: "Pasta", emoji: "🍝", items: 12, revenue: 5310, share: 21, description: "Made fresh every morning" },
  { id: "c3", name: "Grill & mains", emoji: "🥩", items: 16, revenue: 4890, share: 20, description: "Slow-cooked over charcoal" },
  { id: "c4", name: "Starters", emoji: "🥗", items: 18, revenue: 2760, share: 11, description: "Small plates to share" },
  { id: "c5", name: "Desserts", emoji: "🍰", items: 11, revenue: 1720, share: 7, description: "Baked in-house" },
  { id: "c6", name: "Drinks", emoji: "🍹", items: 29, revenue: 1680, share: 7, description: "Coolers, coffee and lassi" },
];

export const products: Product[] = [
  { id: "P-1001", name: "Margherita", emoji: "🍕", category: "Wood-fired pizza", price: 12.5, stock: 64, sold: 1284, rating: 4.9, status: "Active" },
  { id: "P-1002", name: "Diavola", emoji: "🌶️", category: "Wood-fired pizza", price: 14.0, stock: 41, sold: 902, rating: 4.7, status: "Active" },
  { id: "P-1003", name: "Truffle Funghi", emoji: "🍄", category: "Wood-fired pizza", price: 17.5, stock: 8, sold: 611, rating: 4.8, status: "Low stock" },
  { id: "P-1004", name: "Tagliatelle al Ragù", emoji: "🍝", category: "Pasta", price: 15.0, stock: 52, sold: 1010, rating: 4.9, status: "Active" },
  { id: "P-1005", name: "Cacio e Pepe", emoji: "🧀", category: "Pasta", price: 13.5, stock: 37, sold: 744, rating: 4.6, status: "Active" },
  { id: "P-1006", name: "Charcoal Ribeye", emoji: "🥩", category: "Grill & mains", price: 28.0, stock: 12, sold: 402, rating: 4.9, status: "Low stock" },
  { id: "P-1007", name: "Grilled Sea Bass", emoji: "🐟", category: "Grill & mains", price: 24.0, stock: 0, sold: 318, rating: 4.5, status: "Out of stock" },
  { id: "P-1008", name: "Burrata & Tomato", emoji: "🍅", category: "Starters", price: 9.5, stock: 70, sold: 866, rating: 4.8, status: "Active" },
  { id: "P-1009", name: "Garlic Flatbread", emoji: "🥖", category: "Starters", price: 6.0, stock: 90, sold: 1150, rating: 4.4, status: "Active" },
  { id: "P-1010", name: "Tiramisu", emoji: "🍰", category: "Desserts", price: 8.0, stock: 26, sold: 692, rating: 5.0, status: "Active" },
  { id: "P-1011", name: "Pistachio Gelato", emoji: "🍨", category: "Desserts", price: 6.5, stock: 0, sold: 240, rating: 4.7, status: "Draft" },
  { id: "P-1012", name: "Mango Lassi", emoji: "🥭", category: "Drinks", price: 4.5, stock: 120, sold: 980, rating: 4.6, status: "Active" },
];

export const orders: Order[] = [
  { id: "#MT-4821", customer: "Ayesha Rahman", items: ["Margherita", "Tiramisu"], total: 20.5, status: "Preparing", channel: "Dine-in", payment: "Card", time: "2 min ago", table: "T-07" },
  { id: "#MT-4820", customer: "Rafiq Hasan", items: ["Charcoal Ribeye", "Garlic Flatbread", "Mango Lassi"], total: 38.5, status: "Out for delivery", channel: "Delivery", payment: "Wallet", time: "9 min ago" },
  { id: "#MT-4819", customer: "Nusrat Jahan", items: ["Tagliatelle al Ragù"], total: 15.0, status: "Pending", channel: "Pickup", payment: "Cash", time: "14 min ago" },
  { id: "#MT-4818", customer: "Tanvir Ahmed", items: ["Diavola", "Burrata & Tomato", "Mango Lassi"], total: 28.0, status: "Delivered", channel: "Delivery", payment: "Card", time: "31 min ago" },
  { id: "#MT-4817", customer: "Sadia Islam", items: ["Truffle Funghi", "Cacio e Pepe"], total: 31.0, status: "Delivered", channel: "Dine-in", payment: "Card", time: "48 min ago", table: "T-02" },
  { id: "#MT-4816", customer: "Imran Hossain", items: ["Margherita"], total: 12.5, status: "Cancelled", channel: "Pickup", payment: "Wallet", time: "1 hr ago" },
  { id: "#MT-4815", customer: "Mahmuda Akter", items: ["Grilled Sea Bass", "Burrata & Tomato"], total: 33.5, status: "Delivered", channel: "Dine-in", payment: "Card", time: "1 hr ago", table: "T-11" },
  { id: "#MT-4814", customer: "Kamal Uddin", items: ["Diavola", "Diavola", "Garlic Flatbread"], total: 34.0, status: "Delivered", channel: "Delivery", payment: "Cash", time: "2 hr ago" },
  { id: "#MT-4813", customer: "Farhana Yasmin", items: ["Tiramisu", "Pistachio Gelato"], total: 14.5, status: "Pending", channel: "Pickup", payment: "Card", time: "2 hr ago" },
  { id: "#MT-4812", customer: "Jahid Karim", items: ["Charcoal Ribeye", "Cacio e Pepe"], total: 41.5, status: "Delivered", channel: "Dine-in", payment: "Card", time: "3 hr ago", table: "T-05" },
];

export const customers: Customer[] = [
  { id: "U-201", name: "Ayesha Rahman", email: "ayesha@example.com", city: "Dhaka", orders: 48, spent: 1284.5, tier: "VIP", lastVisit: "Today" },
  { id: "U-202", name: "Rafiq Hasan", email: "rafiq@example.com", city: "Rajshahi", orders: 36, spent: 962.0, tier: "Gold", lastVisit: "Today" },
  { id: "U-203", name: "Nusrat Jahan", email: "nusrat@example.com", city: "Pabna", orders: 22, spent: 540.0, tier: "Silver", lastVisit: "Yesterday" },
  { id: "U-204", name: "Tanvir Ahmed", email: "tanvir@example.com", city: "Dhaka", orders: 31, spent: 811.5, tier: "Gold", lastVisit: "Today" },
  { id: "U-205", name: "Sadia Islam", email: "sadia@example.com", city: "Bogura", orders: 9, spent: 214.0, tier: "Regular", lastVisit: "3 days ago" },
  { id: "U-206", name: "Imran Hossain", email: "imran@example.com", city: "Pabna", orders: 14, spent: 336.5, tier: "Silver", lastVisit: "Today" },
  { id: "U-207", name: "Mahmuda Akter", email: "mahmuda@example.com", city: "Rajshahi", orders: 52, spent: 1490.0, tier: "VIP", lastVisit: "Today" },
  { id: "U-208", name: "Kamal Uddin", email: "kamal@example.com", city: "Dhaka", orders: 5, spent: 118.0, tier: "Regular", lastVisit: "1 week ago" },
];

export const topDishes = [
  { name: "Margherita", emoji: "🍕", sold: 1284, share: 100 },
  { name: "Garlic Flatbread", emoji: "🥖", sold: 1150, share: 90 },
  { name: "Tagliatelle al Ragù", emoji: "🍝", sold: 1010, share: 79 },
  { name: "Mango Lassi", emoji: "🥭", sold: 980, share: 76 },
  { name: "Diavola", emoji: "🌶️", sold: 902, share: 70 },
];

export const activity = [
  { id: 1, text: "Table T-07 ordered Margherita and Tiramisu", time: "2 min ago", tone: "gold" },
  { id: 2, text: "Truffle Funghi is running low (8 left)", time: "11 min ago", tone: "warning" },
  { id: 3, text: "Order #MT-4818 was delivered to Tanvir Ahmed", time: "31 min ago", tone: "success" },
  { id: 4, text: "Imran Hossain cancelled order #MT-4816", time: "1 hr ago", tone: "danger" },
  { id: 5, text: "New review: 5 stars for Tiramisu", time: "2 hr ago", tone: "gold" },
];

export const reservations = [
  { time: "6:30 PM", name: "Rahman family", guests: 6, table: "T-12" },
  { time: "7:00 PM", name: "Sadia Islam", guests: 2, table: "T-03" },
  { time: "7:30 PM", name: "Office dinner", guests: 10, table: "Long table" },
  { time: "8:15 PM", name: "Jahid Karim", guests: 4, table: "T-05" },
];

export const trafficSources = [
  { name: "Direct", value: 41, color: "var(--chart-1)" },
  { name: "Google search", value: 27, color: "var(--chart-2)" },
  { name: "Social media", value: 19, color: "var(--chart-3)" },
  { name: "Referrals", value: 13, color: "var(--chart-4)" },
];

export const funnel = [
  { label: "Menu views", value: 18420 },
  { label: "Added to cart", value: 6210 },
  { label: "Started checkout", value: 3120 },
  { label: "Completed order", value: 2480 },
];

export const reports = [
  { id: "R-31", name: "Monthly sales summary", desc: "Revenue, orders and average bill by day", range: "Sep 2026", format: "PDF", size: "412 KB", updated: "Today, 9:12 AM" },
  { id: "R-30", name: "Inventory and wastage", desc: "Stock levels, low items and waste cost", range: "Sep 2026", format: "XLSX", size: "88 KB", updated: "Yesterday" },
  { id: "R-29", name: "Customer growth", desc: "New, returning and lapsed customers", range: "Q3 2026", format: "PDF", size: "296 KB", updated: "Sep 15" },
  { id: "R-28", name: "Menu performance", desc: "Best and worst dishes by margin", range: "Aug 2026", format: "CSV", size: "41 KB", updated: "Sep 1" },
  { id: "R-27", name: "Staff and shifts", desc: "Hours, covers per server and tips", range: "Aug 2026", format: "XLSX", size: "64 KB", updated: "Sep 1" },
];

export const money = (n: number, digits = 2) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
