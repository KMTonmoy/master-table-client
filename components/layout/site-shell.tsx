"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Wraps the public website (Navbar + Footer + centered container).
 * Dashboard routes render edge-to-edge with their own sidebar/topbar,
 * so the site chrome and the max-width container are skipped there.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboard) return <>{children}</>;

  return (
    <>
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-row">{children}</div>
      <Footer />
    </>
  );
}
