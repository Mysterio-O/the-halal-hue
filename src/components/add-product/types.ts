export type PriceTier = { id: string; price: string; quantity: string }
export type ImageFile = { id: string; file: File; preview: string; isPrimary: boolean }
export type Category = { id: string; cat_name: string; cat_description?: string }
export type Offer = {
    id: string
    off_name: string
    off_discount_percentage: number
    description?: string
    off_ends?: string | null
    off_status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
}

export type ProductForm = {
    pr_name: string
    pr_description: string
    pr_sku: string
    cat_id: string
    off_id: string
    pr_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}