import { createServerSupabase } from '@/utils/supabase/server';

export interface OfferProductSummary {
    id: string;
    pr_name: string;
    off_id: string | null;
    primaryPhotoUrl: string | null;
    lowestPrice: number | null;
}

export interface OfferWithCount {
    id: string;
    off_name: string;
    description: string | null;
    off_ends: string | null;
    off_discount_percentage: number | null;
    off_status: string;
    created_at: string;
    productCount: number;
    expiryLabel?: string | null;
    isExpiringSoon?: boolean;
    products: OfferProductSummary[];
}

function getExpiryMeta(dateStr: string | null): { label: string | null; isExpiringSoon: boolean } {
    if (!dateStr) return { label: null, isExpiringSoon: false };
    const date = new Date(dateStr);
    const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: 'Ends today', isExpiringSoon: true };
    if (diffDays === 1) return { label: 'Ends tomorrow', isExpiringSoon: true };
    if (diffDays <= 7) return { label: `Ends in ${diffDays} days`, isExpiringSoon: diffDays <= 3 };
    return {
        label: `Until ${date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short' })}`,
        isExpiringSoon: false,
    };
}

export async function getActiveOffers(): Promise<OfferWithCount[]> {
    const supabase = await createServerSupabase();

    // Fetch active offers
    const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select('id, off_name, description, off_ends, off_discount_percentage, off_status, created_at')
        .eq('off_status', 'ACTIVE')
        .order('created_at', { ascending: false });

    if (offersError) {
        console.error('[getActiveOffers]', offersError.message);
        return [];
    }

    if (!offers || offers.length === 0) return [];

    const now = Date.now();
    const activeOffers = offers.filter((offer) => {
        if (!offer.off_ends) return true;
        return new Date(offer.off_ends).getTime() >= now;
    });

    if (activeOffers.length === 0) return [];

    const offerIds = activeOffers.map((offer) => offer.id);

    const { data: linkedProducts, error: productError } = await supabase
        .from('products')
        .select(`
            id,
            pr_name,
            off_id,
            price_lists ( price, quantity ),
            product_photos ( photo_url, is_primary )
        `)
        .eq('pr_status', 'ACTIVE')
        .in('off_id', offerIds)
        .order('created_at', { ascending: false });

    if (productError) {
        console.error('[getActiveOffers:products]', productError.message);
    }

    const productsByOffer = new Map<string, OfferProductSummary[]>();

    for (const rawProduct of linkedProducts ?? []) {
        if (!rawProduct.off_id) continue;

        const photos = Array.isArray(rawProduct.product_photos)
            ? rawProduct.product_photos
            : [];

        const primaryPhoto =
            photos.find((photo) => photo.is_primary) ??
            photos[0] ??
            null;

        const prices = Array.isArray(rawProduct.price_lists)
            ? rawProduct.price_lists
            : [];

        const lowestPrice = prices.length
            ? Math.min(...prices.map((priceRow) => Number(priceRow.price)))
            : null;

        const summary: OfferProductSummary = {
            id: rawProduct.id,
            pr_name: rawProduct.pr_name,
            off_id: rawProduct.off_id,
            primaryPhotoUrl: primaryPhoto?.photo_url ?? null,
            lowestPrice,
        };

        const prev = productsByOffer.get(rawProduct.off_id) ?? [];
        prev.push(summary);
        productsByOffer.set(rawProduct.off_id, prev);
    }

    return activeOffers.map((offer) => {
        const relatedProducts = productsByOffer.get(offer.id) ?? [];
        const expiryMeta = getExpiryMeta(offer.off_ends);
        return {
            ...offer,
            productCount: relatedProducts.length,
            expiryLabel: expiryMeta.label,
            isExpiringSoon: expiryMeta.isExpiringSoon,
            products: relatedProducts.slice(0, 4),
        };
    });
}