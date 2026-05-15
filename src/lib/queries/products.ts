import { createServerSupabase } from '@/utils/supabase/server';
import { Product, ProductWithDerived } from '@/types/product';

function deriveProduct(product: Product): ProductWithDerived {
    const primaryPhoto =
        product.product_photos.find((p) => p.is_primary) ??
        product.product_photos[0] ??
        null;

    const sortedPrices = [...product.price_lists].sort(
        (a, b) => a.quantity - b.quantity
    );

    const lowestPrice = sortedPrices[0] ?? null;

    const isOnOffer =
        !!product.offers &&
        product.offers.off_status === 'ACTIVE' &&
        !!product.offers.off_discount_percentage;

    const discountPct =
        isOnOffer && product.offers?.off_discount_percentage
            ? product.offers.off_discount_percentage
            : null;

    return {
        ...product,
        primaryPhoto,
        sortedPrices,
        lowestPrice,
        discountPct,
        isOnOffer,
    };
}

const PRODUCT_SELECT = `
  id,
  cat_id,
  off_id,
  pr_name,
  pr_description,
  pr_status,
  pr_sku,
  created_at,
  updated_at,
  categories ( id, cat_name, cat_description, cat_status ),
  offers ( id, off_name, off_discount_percentage, off_ends, off_status ),
  price_lists ( id, product_id, price, quantity, created_at, updated_at ),
  product_photos ( id, product_id, photo_url, storage_path, is_primary, created_at, updated_at )
`;

/** Homepage: latest 8 active products, no filters */
export async function getFeaturedProducts(): Promise<ProductWithDerived[]> {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('pr_status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(8);

    if (error) {
        console.error('[getFeaturedProducts]', error.message);
        return [];
    }

    return (data as unknown as Product[]).map(deriveProduct);
}

export interface GetProductsOptions {
    page?: number;       // 1-indexed, default 1
    perPage?: number;    // default 16
    catId?: string;      // filter by category uuid
}

export interface GetProductsResult {
    products: ProductWithDerived[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

/** /products page: paginated + optional category filter */
export async function getProducts(
    opts: GetProductsOptions = {}
): Promise<GetProductsResult> {
    const { page = 1, perPage = 16, catId } = opts;
    const supabase = await createServerSupabase();

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .eq('pr_status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (catId) {
        query = query.eq('cat_id', catId);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('[getProducts]', error.message);
        return { products: [], total: 0, page, perPage, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / perPage);

    return {
        products: (data as unknown as Product[]).map(deriveProduct),
        total,
        page,
        perPage,
        totalPages,
    };
}

export async function getProductById(
    id: string
): Promise<ProductWithDerived | null> {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('id', id)
        .eq('pr_status', 'ACTIVE')
        .single();

    if (error) {
        console.error('[getProductById]', error.message);
        return null;
    }

    return deriveProduct(data as unknown as Product);
}

/** Fetch all active products — use sparingly, no pagination */
export async function getActiveProducts(): Promise<ProductWithDerived[]> {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('pr_status', 'ACTIVE')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getActiveProducts]', error.message);
        return [];
    }

    return (data as unknown as Product[]).map(deriveProduct);
}