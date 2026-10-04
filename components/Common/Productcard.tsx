import Image from "next/image";
import Link from "next/link";
import { Flame, Plus, Star } from "lucide-react";
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
  _id: string;
  name: string;
  description: string;
  price: number;
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
        isVeg ? "border-green-600" : "border-red-600",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isVeg ? "bg-green-600" : "bg-red-600",
        )}
      />
    </span>
  );
};

const SpiceMark = ({ level }: { level: number }) => (
  <span
    aria-label={`Spice level ${level} of 4`}
    title={`Spice level ${level} of 4`}
    className="inline-flex items-center gap-0.5"
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <Flame
        key={i}
        className={cn(
          "h-3 w-3",
          i < level ? "fill-primary text-primary" : "text-muted-foreground/30",
        )}
      />
    ))}
  </span>
);

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

type ProductCardProps = {
  dish: Dish;
  onQuickAdd?: (dish: Dish) => void;
};

const ProductCard = ({ dish, onQuickAdd }: ProductCardProps) => {
  const primaryImage = dish.images?.[0] ?? "/placeholder.jpg";
  const isAvailable = dish.isAvailable ?? true;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.(dish);
  };

  return (
    <Link
      href={`/menu/${dish._id}`}
      aria-label={`View details for ${dish.name}`}
      aria-disabled={!isAvailable}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/15 p-1.5 shadow-[0_10px_45px_-16px_rgba(74,46,32,0.28)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 hover:border-[#E0A526]/40 hover:bg-white/25 hover:shadow-[0_26px_65px_-18px_rgba(74,46,32,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:rounded-3xl sm:p-2",
        !isAvailable && "hover:shadow-[0_10px_45px_-16px_rgba(74,46,32,0.28)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 hidden h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(236,244,255,0.85),transparent_70%)] blur-2xl transition-transform duration-[1400ms] ease-out group-hover:translate-x-3 group-hover:translate-y-2 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_70%)] sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -right-10 hidden h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,236,200,0.7),transparent_70%)] blur-2xl transition-transform duration-[1600ms] ease-out group-hover:-translate-x-2 group-hover:-translate-y-3 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)] sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E0A526]/0 blur-3xl transition-all duration-700 group-hover:bg-[#E0A526]/25"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 z-10 hidden h-px bg-gradient-to-r from-transparent via-white/90 to-transparent sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] z-10 rounded-[calc(1rem-1px)] ring-1 ring-inset ring-white/40 sm:rounded-[calc(1.5rem-1px)]"
      />

      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:rounded-2xl">
        <Image
          src={primaryImage}
          alt={dish.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 33vw"
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]",
            !isAvailable && "grayscale",
          )}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

        <span className="absolute left-1.5 top-1.5 rounded-full border border-white/60 bg-white/20 px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm backdrop-blur-md backdrop-saturate-150 sm:left-2 sm:top-2 sm:px-2.5 sm:py-1 sm:text-[11px]">
          {CATEGORY_LABEL[dish.category] ?? dish.category}
        </span>

        {dish.isFeatured && isAvailable && (
          <span className="absolute right-1.5 top-1.5 rounded-full border border-amber-200/70 bg-gradient-to-br from-amber-300 to-[#E0A526] px-2 py-0.5 text-[9px] font-semibold text-amber-950 shadow-[0_0_12px_rgba(224,165,38,0.5)] backdrop-blur-md sm:right-2 sm:top-2 sm:px-2.5 sm:py-1 sm:text-[11px]">
            ★ Featured
          </span>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full border border-white/40 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white sm:px-4 sm:py-1.5 sm:text-xs">
              Unavailable
            </span>
          </div>
        )}

        {isAvailable && onQuickAdd && (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Quick add ${dish.name}`}
            className="
              absolute bottom-1.5 right-1.5 z-20 inline-flex h-7 w-7 items-center justify-center
              rounded-full bg-gradient-to-br from-[#E0A526] to-[#C78E1E] text-white
              opacity-100 shadow-[0_8px_20px_-4px_rgba(224,165,38,0.6)]
              transition-all duration-500
              hover:scale-110
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
              sm:bottom-2 sm:right-2 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover:opacity-100
            "
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="relative flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <h3
            title={dish.name}
            className="min-w-0 flex-1 truncate font-heading text-sm font-semibold leading-tight text-foreground sm:text-lg sm:leading-snug"
          >
            {dish.name}
          </h3>
          <DietMark diet={dish.diet} />
        </div>

        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:mt-1.5 sm:min-h-[2.5rem] sm:text-sm">
          {dish.description}
        </p>

        <div className="mt-1.5 flex min-h-[1rem] flex-wrap items-center gap-x-2 gap-y-0.5 sm:mt-3 sm:min-h-[1.25rem] sm:gap-x-3 sm:gap-y-1">
          {typeof dish.rating === "number" && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground sm:gap-1 sm:text-xs">
              <Star className="h-3 w-3 fill-primary text-primary sm:h-3.5 sm:w-3.5" />
              {dish.rating.toFixed(1)}
            </span>
          )}
          {typeof dish.spiceLevel === "number" && dish.spiceLevel > 0 && (
            <SpiceMark level={dish.spiceLevel} />
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-1 border-t border-border/40 pt-2 sm:pt-3">
          <span className="font-heading text-sm font-semibold text-foreground sm:text-lg">
            {typeof dish.price === "number" ? `$${dish.price.toFixed(2)}` : "—"}
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-wider text-[#E0A526] opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:inline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
