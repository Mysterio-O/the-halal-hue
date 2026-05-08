export type PerfumeCategory = 'Oud' | 'Floral' | 'Woody' | 'Oriental' | 'Fresh' | 'Citrus'
export type PriceSize = '30ml' | '50ml' | '100ml' | 'Tola'
export type PriceTrend = 'up' | 'down' | 'stable'
export type Concentration = 'Parfum' | 'EDP' | 'EDT' | 'Attar'

export interface PricingEntry {
    size: PriceSize
    price: number
}

export interface Perfume {
    id: string
    name: string
    nameAr?: string
    brand: string
    concentration: Concentration
    category: PerfumeCategory
    description: string
    notes: { top: string[]; heart: string[]; base: string[] }
    pricing: PricingEntry[]
    trend: PriceTrend
    priceChangePercent: number
    isFeatured: boolean
    isHalalCertified: boolean
    imageUrl: string
    lastUpdated: string
}
