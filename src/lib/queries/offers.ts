import { createServerSupabase } from '@/utils/supabase/server';

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

    // For each offer, count how many ACTIVE products reference it
    const counts = await Promise.all(
        offers.map(async (offer) => {
            const { count } = await supabase
                .from('products')
                .select('id', { count: 'exact', head: true })
                .eq('off_id', offer.id)
                .eq('pr_status', 'ACTIVE');
            return { id: offer.id, count: count ?? 0 };
        })
    );

    const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]));

    return offers.map((offer) => {
        const expiryMeta = getExpiryMeta(offer.off_ends);
        return {
            ...offer,
            productCount: countMap[offer.id] ?? 0,
            expiryLabel: expiryMeta.label,
            isExpiringSoon: expiryMeta.isExpiringSoon,
        };
    });
}