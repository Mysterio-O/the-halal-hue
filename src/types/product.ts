export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type CategoryStatus = 'ACTIVE' | 'INACTIVE';
export type OfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface Category {
  id: string;
  cat_name: string;
  cat_description: string | null;
  cat_status: CategoryStatus;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  off_name: string;
  description: string | null;
  off_ends: string | null;
  off_discount_percentage: number | null;
  off_status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface PriceList {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductPhoto {
  id: string;
  product_id: string;
  photo_url: string;
  storage_path: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  cat_id: string;
  off_id: string | null;
  pr_name: string;
  pr_description: string | null;
  pr_status: ProductStatus;
  pr_sku: string;
  created_at: string;
  updated_at: string;
  // joined relations
  categories: Category | null;
  offers: Offer | null;
  price_lists: PriceList[];
  product_photos: ProductPhoto[];
}

// All plain serializable data — no functions (required for RSC → Client Component boundary)
export interface ProductWithDerived extends Product {
  primaryPhoto: ProductPhoto | null;
  sortedPrices: PriceList[]; // sorted ascending by quantity
  lowestPrice: PriceList | null;
  discountPct: number | null; // null = no active offer
  isOnOffer: boolean;
}

/** Pure helper — use this in client components to apply the discount */
export function applyDiscount(price: number, discountPct: number | null): number {
  if (!discountPct) return price;
  return price * (1 - discountPct / 100);
}