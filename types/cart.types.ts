export type CartItem = {
  productId: string;
  name: string;
  emoji: string;
  image: string | null;
  category: string;
  price: number;
  priceChanged: boolean;
  quantity: number;
  lineTotal: number;
  available: boolean;
  reason: string | null;
  addedAt: string | null;
};

export type CartResponse = {
  items: CartItem[];
  count: number;
  subtotal: number;
};
