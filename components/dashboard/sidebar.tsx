"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardNavItem } from "@/types/dashboard.types";

type NavGroup = { title: string; items: DashboardNavItem[] };

const ADMIN_GROUPS: NavGroup[] = [
  {
    title: "Restaurant",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag, badge: "12" },
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Categories", href: "/dashboard/categories", icon: Tag },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
    ],
  },
  {
    title: "Insights",
    items: [
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    title: "Account",
    items: [{ name: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

const USER_GROUPS: NavGroup[] = [
  {
    title: "Account",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "My orders", href: "/dashboard/orders", icon: ShoppingBag },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  isAdmin?: boolean;
};

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen, isAdmin = true }: SidebarProps) => {
  const pathname = usePathname();
  const groups = isAdmin ? ADMIN_GROUPS : USER_GROUPS;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    console.log("[Sidebar] Logout");
  };

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh max-w-[85vw] flex-col",
          "border-r border-border bg-sidebar/95 backdrop-blur-2xl",
          "transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <Link href="/" className="flex items-center gap-3" aria-label="Master Table home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <UtensilsCrossed className="h-5 w-5 text-[#2B1B10]" />
            </span>
            {!isCollapsed && (
              <span className="font-heading text-xl font-bold leading-none tracking-tight text-foreground">Master Table</span>
            )}
          </Link>

          {!isCollapsed && (
            <>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse sidebar"
                className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:inline-flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close sidebar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-3" aria-label="Dashboard">
          {groups.map((group) => (
            <div key={group.title}>
              {!isCollapsed ? (
                <p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground/80">{group.title}</p>
              ) : (
                <div className="mx-3 mb-2 h-px bg-border" />
              )}
              <ul className="space-y-1">
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        title={isCollapsed ? link.name : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                          isCollapsed && "justify-center",
                          active
                            ? "bg-primary/15 text-foreground ring-1 ring-inset ring-primary/30"
                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <span aria-hidden className="absolute inset-y-2.5 left-0 w-1 rounded-full bg-primary" />
                        )}
                        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-current")} />
                        {!isCollapsed && <span className="flex-1 truncate">{link.name}</span>}
                        {!isCollapsed && link.badge && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-[#2B1B10]">
                            {link.badge}
                          </span>
                        )}
                        {isCollapsed && link.badge && (
                          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-sidebar" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Kitchen status */}
        {!isCollapsed && isAdmin && (
          <div className="mx-3 mb-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Kitchen is open
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              12 orders in the queue. Average prep time is 14 minutes.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 space-y-1 border-t border-border p-3">
          <Link
            href="/help"
            title={isCollapsed ? "Help & support" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground",
              isCollapsed && "justify-center",
            )}
          >
            <Headphones className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Help &amp; support</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "justify-center",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
            className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-transform hover:scale-105 lg:flex"
          >
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
          </button>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
