export type ProductStatus =
  | "Active"
  | "Low stock"
  | "Out of stock"
  | "Draft";

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

export type ProductRow = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  rating: number;
  status: ProductStatus;
  description: string;
  images: string[];
  ingredients: string[];
  diet: string;
  cuisine: string;
  spiceLevel: number;
  prepTime: number;
  calories: number;
  tags: string[];
  isFeatured: boolean;
  isAvailable: boolean;
};

export type ProductFormValues = {
  name: string;
  description: string;
  price: string | number;
  category: string;
  diet: string;
  cuisine: string;
  images: string[];
  ingredients: string;
  tags: string;
  spiceLevel: string | number;
  prepTime: string | number;
  calories: string | number;
  isFeatured: boolean;
  isAvailable: boolean;
};

export type EditableProduct = ProductRow;