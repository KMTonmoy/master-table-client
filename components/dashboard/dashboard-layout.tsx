"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      {/* soft ambient light */}
      <div aria-hidden className="pointer-events-none fixed -top-40 left-1/3 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl" />

      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isAdmin
      />

      {/* Content area: takes ALL remaining width, no max-width cap */}
      <div
        className={cn(
          "relative z-10 flex min-h-dvh w-full min-w-0 flex-col transition-[padding] duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-[280px]",
        )}
      >
        <Topbar isScrolled={isScrolled} onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <main className="w-full min-w-0 flex-1 space-y-6 p-4 sm:p-6 lg:p-8 2xl:p-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
