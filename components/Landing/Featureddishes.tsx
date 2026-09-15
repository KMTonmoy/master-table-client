"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import ProductCard, { type Dish } from "../Common/Productcard";

const FeaturedDishesSkeleton = () => (
  <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse overflow-hidden rounded-2xl border border-white/60 bg-white/15 backdrop-blur-2xl"
      >
        <div className="aspect-[4/3] w-full bg-white/25" />
        <div className="space-y-2 p-4">
          <div className="h-4 w-3/4 rounded bg-white/25" />
          <div className="h-3 w-full rounded bg-white/20" />
          <div className="h-3 w-2/3 rounded bg-white/20" />
        </div>
      </div>
    ))}
  </div>
);

const FeaturedDishes = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get<Dish[]>("http://localhost:8000/products")
      .then((res) => {
        if (cancelled) return;

        const featured = res.data.filter((d) => d.isFeatured);
        setDishes(featured.length > 0 ? featured : res.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section relative overflow-hidden bg-secondary/40">
      {/* Ambient cool mist so the glass has something to blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl dark:bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="content-wrap relative px-5">
        <div className="flex items-end justify-between gap-4">
          <h2>Today&apos;s favorites</h2>
          <Link
            href="/menu"
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:inline"
          >
            View full menu
          </Link>
        </div>

        {loading && <FeaturedDishesSkeleton />}

        {!loading && error && (
          <p className="mt-8 rounded-2xl border border-white/60 bg-white/15 p-6 text-sm text-muted-foreground backdrop-blur-2xl">
            Couldn&apos;t load today&apos;s favorites right now. Try refreshing
            the page.
          </p>
        )}

        {!loading && !error && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {dishes.map((dish) => (
              <ProductCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDishes;
