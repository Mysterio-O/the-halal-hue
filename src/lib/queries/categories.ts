import { createServerSupabase } from '@/utils/supabase/server';

export interface CategoryOption {
    id: string;
    cat_name: string;
}

export async function getActiveCategories(): Promise<CategoryOption[]> {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
        .from('categories')
        .select('id, cat_name')
        .eq('cat_status', 'ACTIVE')
        .order('cat_name');

    if (error) {
        console.error('[getActiveCategories]', error.message);
        return [];
    }

    return data;
}