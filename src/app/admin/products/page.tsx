'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, MoreVertical, Pencil, Trash2, ToggleLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
type FilterStatus = 'ALL' | ProductStatus
type SelectOption = { value: string; label: string }

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

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string; next: ProductStatus }> = {
    ACTIVE: { label: 'Active', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', next: 'INACTIVE' },
    INACTIVE: { label: 'Inactive', color: '#facc15', bg: 'rgba(250,204,21,0.15)', next: 'ACTIVE' },
    ARCHIVED: { label: 'Archived', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', next: 'ACTIVE' },
}

const getLowestPrice = (pl: { price: number }[]) =>
    pl.length ? Math.min(...pl.map(p => p.price)) : null

const getPrimaryPhoto = (photos: { photo_url: string; is_primary: boolean }[]) =>
    photos.find(p => p.is_primary)?.photo_url ?? photos[0]?.photo_url ?? null

// ─── Themed Select ───────────────────────────────────────────────────────────
function ThemedSelect({
    value,
    options,
    onChange,
    ariaLabel,
}: {
    value: string
    options: SelectOption[]
    onChange: (value: string) => void
    ariaLabel: string
}) {
    const [open, setOpen] = useState(false)
    const [focused, setFocused] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selected = options.find(opt => opt.value === value) ?? options[0]
    const isActive = open || focused

    const buttonStyle: React.CSSProperties = {
        padding: '9px 38px 9px 12px',
        borderRadius: 12,
        border: `1.5px solid ${isActive ? 'var(--gold)' : 'var(--border-strong)'}`,
        background: 'linear-gradient(135deg, rgba(107,15,15,0.55), rgba(61,10,10,0.78))',
        color: 'var(--ivory)',
        fontSize: 12.5,
        outline: 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        width: '100%',
        height: 40,
        lineHeight: '20px',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.06em',
        boxShadow: isActive
            ? '0 0 0 1px rgba(200,168,75,0.35)'
            : 'inset 0 0 0 1px rgba(200,168,75,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
    }

    return (
        <div ref={ref} className="filter-select" style={{ position: 'relative' }}>
            <button
                type="button"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={buttonStyle}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selected?.label ?? ''}
                </span>
                <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8l4 4 4-4" />
                    </svg>
                </span>
            </button>

            {open && (
                <div
                    role="listbox"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        borderRadius: 12,
                        border: '1px solid var(--border-strong)',
                        background: 'rgba(12,4,4,0.98)',
                        boxShadow: '0 18px 48px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                        maxHeight: 240,
                        overflowY: 'auto',
                    }}
                >
                    {options.map(opt => {
                        const isSelected = opt.value === value
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(opt.value)
                                    setOpen(false)
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: isSelected
                                        ? 'linear-gradient(90deg, rgba(200,168,75,0.18), rgba(61,10,10,0.2))'
                                        : 'transparent',
                                    color: isSelected ? 'var(--gold-light)' : 'var(--ivory)',
                                    fontSize: 12.5,
                                    fontFamily: 'var(--font-display)',
                                    letterSpacing: '0.06em',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    borderLeft: isSelected ? '3px solid var(--gold)' : '3px solid transparent',
                                    transition: 'background .15s ease, color .15s ease',
                                }}
                                onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = 'rgba(200,168,75,0.08)'
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                                }}
                            >
                                {opt.label}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ padding: '10px 12px 12px' }}>
                {[70, 45].map((w, i) => (
                    <div key={i} style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', width: `${w}%`, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    )
}

// ─── 3-dot Menu ───────────────────────────────────────────────────────────────
function CardMenu({ product, onStatusChange, onDelete }: {
    product: Product
    onStatusChange: (id: string, status: ProductStatus) => void
    onDelete: (id: string) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const status = STATUS_CONFIG[product.pr_status]
    const router = useRouter()

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const menuItem = (icon: React.ReactNode, label: string, onClick: () => void, danger = false) => (
        <button
            type="button"
            onClick={() => { onClick(); setOpen(false) }}
            style={{
                width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                color: danger ? '#f87171' : 'var(--ivory)', fontSize: 12.5, cursor: 'pointer',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 6, transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
            {icon} {label}
        </button>
    )

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
                style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none',
                    background: open ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(6px)',
                    color: 'var(--ivory)', cursor: 'pointer',
                    display: 'grid', placeItems: 'center',
                    transition: 'background .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = open ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.5)' }}
            >
                <MoreVertical size={14} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 32, right: 0, zIndex: 1000,
                    minWidth: 170, borderRadius: 10, padding: '6px',
                    border: '1px solid var(--border)',
                    background: 'rgba(10,4,4,0.97)', backdropFilter: 'blur(16px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                }}>
                    {menuItem(
                        <Eye size={13} />,
                        'View Details',
                        () => router.push(`/admin/products/${product.id}`)
                    )}
                    {menuItem(
                        <Pencil size={13} />,
                        'Edit Product',
                        () => router.push(`/admin/add-product?id=${product.id}`)
                    )}
                    {menuItem(
                        <ToggleLeft size={13} />,
                        `Mark ${status.next === 'ACTIVE' ? 'Active' : 'Inactive'}`,
                        () => onStatusChange(product.id, status.next)
                    )}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                    {menuItem(
                        <Trash2 size={13} />,
                        'Delete Product',
                        () => onDelete(product.id),
                        true
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index, onStatusChange, onDelete }: {
    product: Product
    index: number
    onStatusChange: (id: string, status: ProductStatus) => void
    onDelete: (id: string) => void
}) {
    const photo = getPrimaryPhoto(product.product_photos)
    const lowestPrice = getLowestPrice(product.price_lists)
    const status = STATUS_CONFIG[product.pr_status]

    return (
        <div style={{
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.025)',
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
            animation: `fadeUp .35s ease both`,
            animationDelay: `${Math.min(index * 0.04, 0.32)}s`,
        }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.45)'
                el.style.borderColor = 'var(--border-hover, rgba(200,168,75,0.3))'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
                el.style.borderColor = 'var(--border)'
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                {photo
                    ? <img src={photo} alt={product.pr_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 28, opacity: 0.4 }}>📦</div>
                }

                {/* Status dot */}
                <div style={{
                    position: 'absolute', top: 8, left: 8,
                    width: 8, height: 8, borderRadius: '50%',
                    background: status.color,
                    boxShadow: `0 0 6px ${status.color}`,
                }} title={status.label} />

                {/* Offer badge */}
                {product.offers && (
                    <div style={{
                        position: 'absolute', top: 6, left: 20,
                        padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                        background: 'var(--gold)', color: '#1a0a00', letterSpacing: '0.05em',
                    }}>
                        {product.offers.off_discount_percentage}% OFF
                    </div>
                )}

                {/* 3-dot menu */}
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                    <CardMenu product={product} onStatusChange={onStatusChange} onDelete={onDelete} />
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '10px 12px 12px' }}>
                {/* Name */}
                <div style={{
                    fontWeight: 600, fontSize: 13, color: 'var(--ivory)',
                    lineHeight: 1.3, marginBottom: 6,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                    {product.pr_name}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {lowestPrice !== null ? (
                        <>
                            <span style={{ fontSize: 9, color: 'var(--ivory-dim)' }}>from</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>
                                ৳{lowestPrice.toLocaleString()}
                            </span>
                        </>
                    ) : (
                        <span style={{ fontSize: 11, color: 'var(--ivory-dim)' }}>No price</span>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ productName, onConfirm, onCancel, loading }: {
    productName: string
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}) {
    return (
        <div
            onClick={onCancel}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                display: 'grid', placeItems: 'center', padding: 16,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 380, borderRadius: 16,
                    border: '1px solid rgba(248,113,113,0.25)',
                    background: 'rgba(12,4,4,0.98)',
                    padding: '28px 24px 24px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                }}
            >
                <div style={{ fontSize: 32, marginBottom: 14, textAlign: 'center' }}>🗑️</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--ivory)', textAlign: 'center' }}>
                    Delete Product?
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--ivory-dim)', textAlign: 'center', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--ivory)' }}>{productName}</strong> will be permanently deleted along with its photos and price tiers.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 10,
                            border: '1.5px solid var(--border)', background: 'transparent',
                            color: 'var(--ivory-dim)', cursor: 'pointer', fontSize: 14,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                            background: loading ? 'rgba(239,68,68,0.4)' : '#dc2626',
                            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: 14, fontWeight: 600,
                        }}
                    >
                        {loading ? 'Deleting…' : 'Delete'}
                    </button>
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
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function fetch() {
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
        fetch()
        return () => { cancelled = true }
    }, [filterStatus, filterCat])

    useEffect(() => {
        supabase.from('categories').select('id, cat_name').eq('cat_status', 'ACTIVE')
            .then(({ data }) => setCategories(data ?? []))
    }, [])

    // Status change
    const handleStatusChange = async (id: string, newStatus: ProductStatus) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, pr_status: newStatus } : p))
        await supabase.from('products').update({ pr_status: newStatus }).eq('id', id)
    }

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            // Delete storage files
            // const paths = deleteTarget.product_photos.map(ph => ph.storage_path ?? '').filter(Boolean)

            // Hmm, storage_path isn't in our Product type select — delete DB records first,
            // storage cleanup can be done separately or via DB cascade/trigger.
            await supabase.from('product_photos').delete().eq('product_id', deleteTarget.id)
            await supabase.from('price_lists').delete().eq('product_id', deleteTarget.id)
            await supabase.from('products').delete().eq('id', deleteTarget.id)

            setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
            setDeleteTarget(null)
        } finally {
            setDeleting(false)
        }
    }

    // Client-side filter + sort
    const visible = products
        .filter(p => {
            if (!search.trim()) return true
            const q = search.toLowerCase()
            return p.pr_name.toLowerCase().includes(q)
                || p.pr_sku.toLowerCase().includes(q)
                || p.pr_description?.toLowerCase().includes(q)
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            if (sortBy === 'name') return a.pr_name.localeCompare(b.pr_name)
            if (sortBy === 'price') return (getLowestPrice(a.price_lists) ?? 0) - (getLowestPrice(b.price_lists) ?? 0)
            return 0
        })

    const statusOptions: SelectOption[] = [
        { value: 'ALL', label: 'All Statuses' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'ARCHIVED', label: 'Archived' },
    ]

    const categoryOptions: SelectOption[] = [
        { value: '', label: 'All Categories' },
        ...categories.map(c => ({ value: c.id, label: c.cat_name })),
    ]

    const sortOptions: SelectOption[] = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'name', label: 'Name A-Z' },
        { value: 'price', label: 'Price Asc' },
    ]

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                .filter-bar {
                    display: grid;
                    grid-template-columns: 1fr repeat(3, auto);
                    gap: 10px;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .filter-select { width: auto; min-width: 130px; }

                @media (max-width: 900px) {
                    .products-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 600px) {
                    .products-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                    .filter-bar { grid-template-columns: 1fr; }
                    .filter-select { width: 100%; min-width: unset; }
                }
            `}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px', boxSizing: 'border-box' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'var(--font-display, Georgia, serif)',
                            fontSize: 'clamp(20px, 4vw, 28px)', margin: 0, color: 'var(--ivory)',
                        }}>
                            Products
                        </h1>
                        <p style={{ color: 'var(--ivory-dim)', marginTop: 4, fontSize: 13 }}>
                            {loading ? '…' : `${visible.length} product${visible.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <a
                        href="/admin/add-product"
                        className="btn-gold"
                        style={{ textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <span>＋</span> Add Product
                    </a>
                </div>

                {/* Filter bar */}
                <div className="filter-bar">
                    {/* Search */}
                    <input
                        style={{
                            padding: '9px 14px', borderRadius: 10,
                            border: '1.5px solid var(--border)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'var(--ivory)', fontSize: 13, outline: 'none',
                            width: '100%', boxSizing: 'border-box',
                        }}
                        placeholder="Search name, SKU…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    />

                    <ThemedSelect
                        ariaLabel="Filter by status"
                        value={filterStatus}
                        options={statusOptions}
                        onChange={value => setFilterStatus(value as FilterStatus)}
                    />

                    <ThemedSelect
                        ariaLabel="Filter by category"
                        value={filterCat}
                        options={categoryOptions}
                        onChange={setFilterCat}
                    />

                    <ThemedSelect
                        ariaLabel="Sort products"
                        value={sortBy}
                        options={sortOptions}
                        onChange={value => setSortBy(value as typeof sortBy)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="products-grid">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : visible.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ivory-dim)' }}>
                        <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
                        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ivory)', marginBottom: 6 }}>No products found</div>
                        <div style={{ fontSize: 13 }}>Adjust your filters or add a new product.</div>
                    </div>
                ) : (
                    <div className="products-grid">
                        {visible.map((p, i) => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                index={i}
                                onStatusChange={handleStatusChange}
                                onDelete={() => setDeleteTarget(p)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete confirm */}
            {deleteTarget && (
                <DeleteModal
                    productName={deleteTarget.pr_name}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </>
    )
}