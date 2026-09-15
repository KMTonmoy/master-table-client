import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type DishCategory =
  | "food"
  | "drink"
  | "soft-drink"
  | "hard-drink"
  | "beef"
  | "chicken"
  | "seafood"
  | "vegan"
  | "breakfast"
  | "snacks"
  | "dessert";

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** ✅ Array of image URLs (first one is the primary/thumbnail) */
  images: string[];
  ingredients?: string[];
  diet: "veg" | "non-veg" | "vegan";
  category: DishCategory;
  cuisine?: string;
  spiceLevel?: 0 | 1 | 2 | 3 | 4;
  prepTime?: number;
  calories?: number;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
};

const DietMark = ({ diet }: { diet: Dish["diet"] }) => {
  const isVeg = diet === "veg" || diet === "vegan";
  const label =
    diet === "vegan" ? "Vegan" : isVeg ? "Vegetarian" : "Non-vegetarian";

  return (
    <span
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border backdrop-blur-sm",
        isVeg ? "border-green-600" : "border-red-600"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isVeg ? "bg-green-600" : "bg-red-600"
        )}
      />
    </span>
  );
};

const CATEGORY_LABEL: Record<DishCategory, string> = {
  food: "Food",
  drink: "Drink",
  "soft-drink": "Soft drink",
  "hard-drink": "Hard drink",
  beef: "Beef",
  chicken: "Chicken",
  seafood: "Seafood",
  vegan: "Vegan",
  breakfast: "Breakfast",
  snacks: "Snacks",
  dessert: "Dessert",
};

const ProductCard = ({ dish }: { dish: Dish }) => {
  // ✅ Primary image from the array
  const primaryImage = dish.images?.[0] ?? "/placeholder.jpg";
  // ✅ Optional hover image (second image if available)
  const hoverImage = dish.images?.[1];

  return (
    <Link
      href={`/menu/${dish.id}`}
      aria-label={`View details for ${dish.name}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/15 shadow-[0_10px_45px_-16px_rgba(30,64,110,0.28)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 hover:border-white/90 hover:bg-white/25 hover:shadow-[0_26px_65px_-18px_rgba(30,64,110,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      {/* Drifting ice-white smoke inside the glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(236,244,255,0.85),transparent_70%)] blur-2xl transition-transform duration-[1400ms] ease-out group-hover:translate-x-3 group-hover:translate-y-2 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(220,235,255,0.7),transparent_70%)] blur-2xl transition-transform duration-[1600ms] ease-out group-hover:-translate-x-2 group-hover:-translate-y-3 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] z-10 rounded-[calc(1rem-1px)] ring-1 ring-inset ring-white/40"
      />

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* ✅ Primary image */}
        <Image
          src={primaryImage}
          alt={dish.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className={cn(
            "object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]",
            // Fade out primary on hover if a hover image exists
            hoverImage && "group-hover:opacity-0"
          )}
        />

        {/* ✅ Hover image (2nd image in array) — fades in on hover */}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${dish.name} alternate`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:opacity-100"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-[rgba(236,244,255,0.35)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Category pill — cool misty glass */}
        <span className="absolute left-2 top-2 rounded-full border border-white/60 bg-white/25 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md backdrop-saturate-150">
          {CATEGORY_LABEL[dish.category] ?? dish.category}
        </span>

        {/* ✅ Featured badge */}
        {dish.isFeatured && (
          <span className="absolute right-2 top-2 rounded-full border border-amber-200/70 bg-amber-400/80 px-2.5 py-1 text-[11px] font-semibold text-amber-950 shadow-sm backdrop-blur-md">
            ★ Featured
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">
            {dish.name}
          </h3>
          <DietMark diet={dish.diet} />
        </div>

        {/* ✅ Description */}
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {dish.description}
        </p>

        {/* ✅ Price only — no button */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-heading text-base font-semibold text-foreground">
            ${dish.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;