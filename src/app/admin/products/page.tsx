'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

type Product = {
    id: string
    pr_name: string
    pr_description: string | null
    pr_sku: string
    pr_status: ProductStatus
    created_at: string
    categories: { cat_name: string } | null
    offers: { off_name: string; off_discount_percentage: number } | null
    product_photos: { photo_url: string; is_primary: boolean }[]
    price_lists: { price: number; quantity: number }[]
}

type FilterStatus = 'ALL' | ProductStatus

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: 'Active', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    INACTIVE: { label: 'Inactive', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
    ARCHIVED: { label: 'Archived', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}

function getLowestPrice(priceLists: { price: number; quantity: number }[]) {
    if (!priceLists.length) return null
    return Math.min(...priceLists.map(p => p.price))
}

function getPrimaryPhoto(photos: { photo_url: string; is_primary: boolean }[]) {
    return photos.find(p => p.is_primary)?.photo_url ?? photos[0]?.photo_url ?? null
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
            <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ padding: 16 }}>
                {[80, 60, 40].map((w, i) => (
                    <div key={i} style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', width: `${w}%`, marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
    const photo = getPrimaryPhoto(product.product_photos)
    const lowestPrice = getLowestPrice(product.price_lists)
    const status = STATUS_CONFIG[product.pr_status as ProductStatus] ?? STATUS_CONFIG.INACTIVE
    const hasOffer = !!product.offers

    return (
        <div
            style={{
                borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                background: 'rgba(255,255,255,0.03)',
                transition: 'transform .2s, box-shadow .2s',
                animation: `fadeUp .4s ease both`,
                animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
                cursor: 'default',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                    ; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                {photo ? (
                    <img src={photo} alt={product.pr_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 32 }}>📦</div>
                )}

                {/* Status badge */}
                <div style={{
                    position: 'absolute', top: 10, left: 10,
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    color: status.color, background: status.bg,
                    backdropFilter: 'blur(8px)', border: `1px solid ${status.color}33`,
                }}>
                    {status.label}
                </div>

                {/* Offer badge */}
                {hasOffer && (
                    <div style={{
                        position: 'absolute', top: 10, right: 10,
                        padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.07em', background: 'var(--gold, #d4af37)',
                        color: '#000', backdropFilter: 'blur(8px)',
                    }}>
                        {product.offers!.off_discount_percentage}% OFF
                    </div>
                )}

                {/* Photo count */}
                {product.product_photos.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: 10, right: 10,
                        padding: '2px 8px', borderRadius: 20, fontSize: 10,
                        background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(4px)',
                    }}>
                        📷 {product.product_photos.length}
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: '14px 16px 16px' }}>
                {/* Category */}
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold, #d4af37)', marginBottom: 5 }}>
                    {product.categories?.cat_name ?? 'Uncategorized'}
                </div>

                {/* Name */}
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ivory, #f5f0e8)', lineHeight: 1.35, marginBottom: 6 }}>
                    {product.pr_name}
                </div>

                {/* SKU */}
                <div style={{ fontSize: 11, color: 'var(--ivory-dim, #9e9e9e)', marginBottom: 10, fontFamily: 'monospace' }}>
                    SKU: {product.pr_sku}
                </div>

                {/* Price tiers */}
                {product.price_lists.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                        {product.price_lists
                            .sort((a, b) => a.quantity - b.quantity)
                            .slice(0, 3)
                            .map((tier, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: i < Math.min(product.price_lists.length, 3) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <span style={{ fontSize: 12, color: 'var(--ivory-dim, #9e9e9e)' }}>
                                        {tier.quantity} {tier.quantity === 1 ? 'pc' : 'pcs'}
                                    </span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ivory, #f5f0e8)' }}>
                                        ৳{tier.price.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        {product.price_lists.length > 3 && (
                            <div style={{ fontSize: 11, color: 'var(--ivory-dim, #9e9e9e)', marginTop: 4 }}>
                                +{product.price_lists.length - 3} more tiers
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {lowestPrice !== null ? (
                        <div>
                            <span style={{ fontSize: 10, color: 'var(--ivory-dim)', marginRight: 4 }}>from</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold, #d4af37)' }}>৳{lowestPrice.toLocaleString()}</span>
                        </div>
                    ) : (
                        <span style={{ fontSize: 12, color: 'var(--ivory-dim)' }}>No price set</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--ivory-dim, #9e9e9e)' }}>{formatDate(product.created_at)}</span>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
    const [filterCat, setFilterCat] = useState('')
    const [categories, setCategories] = useState<{ id: string; cat_name: string }[]>([])
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'price'>('newest')

    // const fetchProducts = useCallback(async () => {
    //     setLoading(true)
    //     let query = supabase
    //         .from('products')
    //         .select(`
    //     id, pr_name, pr_description, pr_sku, pr_status, created_at,
    //     categories ( cat_name ),
    //     offers ( off_name, off_discount_percentage ),
    //     product_photos ( photo_url, is_primary ),
    //     price_lists ( price, quantity )
    //   `)

    //     if (filterStatus !== 'ALL') query = query.eq('pr_status', filterStatus)
    //     if (filterCat) query = query.eq('cat_id', filterCat)

    //     const { data } = await query
    //     setProducts((data as unknown as Product[]) ?? [])
    //     setLoading(false)
    // }, [filterStatus, filterCat])

    useEffect(() => {
    let cancelled = false

    async function fetchProducts() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select(`
          id, pr_name, pr_description, pr_sku, pr_status, created_at,
          categories ( cat_name ),
          offers ( off_name, off_discount_percentage ),
          product_photos ( photo_url, is_primary ),
          price_lists ( price, quantity )
        `)

      if (filterStatus !== 'ALL') query = query.eq('pr_status', filterStatus)
      if (filterCat) query = query.eq('cat_id', filterCat)

      const { data } = await query
      if (!cancelled) {
        setProducts((data as unknown as Product[]) ?? [])
        setLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }   // cleanup: ignore stale responses
  }, [filterStatus, filterCat])

    useEffect(() => {
        supabase.from('categories').select('id, cat_name').eq('cat_status', 'ACTIVE')
            .then(({ data }) => setCategories(data ?? []))
    }, [])

    // Client-side search + sort
    const visible = products
        .filter(p => {
            if (!search.trim()) return true
            const q = search.toLowerCase()
            return p.pr_name.toLowerCase().includes(q) || p.pr_sku.toLowerCase().includes(q) || p.pr_description?.toLowerCase().includes(q)
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            if (sortBy === 'name') return a.pr_name.localeCompare(b.pr_name)
            if (sortBy === 'price') return (getLowestPrice(a.price_lists) ?? 0) - (getLowestPrice(b.price_lists) ?? 0)
            return 0
        })

    const inputStyle: React.CSSProperties = {
        padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--border, rgba(255,255,255,0.1))',
        background: 'rgba(255,255,255,0.04)', color: 'var(--ivory, #f5f0e8)',
        fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
    }

    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 'clamp(22px, 5vw, 30px)', margin: 0, color: 'var(--ivory, #f5f0e8)' }}>
                            Products
                        </h1>
                        <p style={{ color: 'var(--ivory-dim, #9e9e9e)', marginTop: 5, fontSize: 14 }}>
                            {loading ? '…' : `${visible.length} product${visible.length !== 1 ? 's' : ''} found`}
                        </p>
                    </div>
                    <a href="/admin/add-product"
                        className="btn-gold"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                        <span>＋</span> Add Product
                    </a>
                </div>

                {/* Filters bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
                    {/* Search */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <input
                            style={{ ...inputStyle, paddingLeft: 36 }}
                            placeholder="Search by name, SKU or description…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Status filter */}
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', background: 'rgba(20,20,20,0.95)' }}>
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>

                    {/* Category filter */}
                    <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', background: 'rgba(20,20,20,0.95)' }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.cat_name}</option>)}
                    </select>

                    {/* Sort */}
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', background: 'rgba(20,20,20,0.95)' }}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name A→Z</option>
                        <option value="price">Price Low→High</option>
                    </select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : visible.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ivory-dim, #9e9e9e)' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ivory)', marginBottom: 8 }}>No products found</div>
                        <div style={{ fontSize: 14 }}>Try adjusting your filters or add a new product.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                        {visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                    </div>
                )}
            </div>
        </>
    )
}