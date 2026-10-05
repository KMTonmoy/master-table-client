import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import SiteShell from "@/components/layout/site-shell";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/components/providers/cart-provider";
import { TRANSLATE_CONTAINER_ID } from "@/lib/languages";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Master Table",
  description: "Family recipes, wood-fired since 1985.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <div id={TRANSLATE_CONTAINER_ID} className="hidden" />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <CartProvider>
              <SiteShell>{children}</SiteShell>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
