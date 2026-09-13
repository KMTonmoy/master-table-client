"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* ── Ambient glows ───────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl sm:-top-32 sm:-right-32 sm:h-96 sm:w-96 md:-top-40 md:-right-40 md:h-[520px] md:w-[520px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-foreground/5 blur-3xl sm:h-80 sm:w-80 md:h-[420px] md:w-[420px]"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-10 sm:gap-12 sm:px-5 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        {/* ── LEFT: Copy ─────────────────────────── */}
        <div className="flex flex-col items-start gap-4 sm:gap-5 md:gap-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-xs">
            <Sparkles className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" />
            Est. 2018 · Farm to Table
          </span>

          {/* Heading */}
          <h1 className="font-heading text-[30px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            A table set for
            <span className="relative ml-1.5 inline-block text-primary sm:ml-2">
              good company
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary/40 sm:-bottom-1 sm:h-1"
              />
            </span>
          </h1>

          {/* Sub */}
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Seasonal plates, slow-cooked classics, and a wine list worth
            lingering over — crafted nightly in our open kitchen.
          </p>

          {/* CTAs */}
          <div className="flex w-full flex-wrap items-center gap-2 pt-1 sm:gap-3 sm:pt-2">
            <Button
              size="lg"
              className="group h-10 px-5 sm:h-11 sm:px-6"
              render={<Link href="/reservations" />}
            >
              Book a Table
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-10 px-5 sm:h-11 sm:px-6"
              render={<Link href="/menu" />}
            >
              View Menu
            </Button>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-3 pt-3 sm:gap-4 sm:pt-4">
            {/* Avatar stack with real photos */}
            <div className="flex -space-x-2.5">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
              ].map((src, i) => (
                <span
                  key={i}
                  className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-background ring-1 ring-border sm:h-7 sm:w-7 md:h-8 md:w-8"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-primary text-primary sm:h-3.5 sm:w-3.5"
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                Loved by 2,400+ guests
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Image collage ───────────────── */}
        <div className="relative">
          {/* Main dish image */}
          <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl border border-border bg-secondary shadow-[0_20px_50px_-25px_rgba(74,46,32,0.5)] sm:max-w-sm sm:rounded-3xl md:max-w-none md:shadow-[0_30px_70px_-30px_rgba(74,46,32,0.5)]">
            <Image
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=1000&fit=crop"
              alt="Signature seasonal dish"
              fill
              priority
              sizes="(max-width: 640px) 320px, (max-width: 1024px) 384px, 560px"
              className="object-cover"
            />
            {/* Warm gradient overlay for text legibility */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent"
            />

            {/* Gold corner accent */}
            <div
              aria-hidden
              className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-primary/40 blur-2xl sm:-top-6 sm:-right-6 sm:h-24 sm:w-24"
            />
          </div>

          {/* Small secondary dish — peeking top-right */}
          <div className="absolute -top-6 -right-4 hidden h-28 w-28 overflow-hidden rounded-2xl border-4 border-background shadow-[0_15px_30px_-15px_rgba(74,46,32,0.5)] sm:-right-6 sm:block sm:h-32 sm:w-32 md:-right-10 md:h-40 md:w-40">
            <Image
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop"
              alt="Wood-fired pizza"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>

          {/* Small dessert image — peeking bottom-right */}
          <div className="absolute -bottom-8 -right-2 hidden h-24 w-24 overflow-hidden rounded-2xl border-4 border-background shadow-[0_15px_30px_-15px_rgba(74,46,32,0.5)] md:-right-8 md:block md:h-32 md:w-32">
            <Image
              src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop"
              alt="Dessert plate"
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>

          {/* Floating rating card — visible on mobile too */}
          <div className="absolute -bottom-4 -left-2 w-40 rounded-xl border border-border bg-card p-3 shadow-[0_15px_30px_-15px_rgba(74,46,32,0.4)] sm:-bottom-6 sm:-left-4 sm:w-52 sm:rounded-2xl sm:p-4 md:w-56">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary sm:h-10 sm:w-10 sm:rounded-xl">
                <Star className="h-4 w-4 fill-primary sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="font-heading text-base font-bold leading-none text-foreground sm:text-lg">
                  4.9
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Google reviews
                </p>
              </div>
            </div>
            <div className="mt-2 h-px w-full bg-border sm:mt-3" />
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground sm:mt-3 sm:text-xs">
              "Best seasonal menu in the city — hands down."
            </p>
          </div>

          {/* Tonight badge — visible on mobile */}
          <div className="absolute -top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm sm:-top-4 sm:left-6 sm:px-3 sm:py-1.5 sm:text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Tonight · Chef's tasting
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;