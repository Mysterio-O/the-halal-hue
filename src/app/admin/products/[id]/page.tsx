import React from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/utils/supabase/server'

type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'
const ALLOWED_ROLES: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']

type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

type ProductDetails = {
    id: string
    pr_name: string
    pr_description: string | null
    pr_sku: string
    pr_status: ProductStatus
    created_at: string
    categories: { cat_name: string } | null
    offers: { off_name: string; off_discount_percentage: number } | null
    product_photos: { photo_url: string; is_primary: boolean }[] | null
    price_lists: { price: number; quantity: number }[] | null
}

const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: 'Active', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
    INACTIVE: { label: 'Inactive', color: '#facc15', bg: 'rgba(250,204,21,0.15)' },
    ARCHIVED: { label: 'Archived', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
}

const fmtPrice = (value: number | null | undefined) =>
    value == null ? 'N/A' : `BDT ${value.toLocaleString('en-BD')}`

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: '2-digit' })

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div
            style={{
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.6))',
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    color: 'var(--gold-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-display)',
                    marginBottom: 6,
                }}
            >
                {label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ivory)' }}>{value}</div>
        </div>
    )
}

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createServerSupabase()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/login?next=/admin/products/${id}`)

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_role')
        .eq('user_id', user.id)
        .single()

    if (!profile?.user_role || !ALLOWED_ROLES.includes(profile.user_role as AppRole)) {
        redirect('/login?reason=forbidden')
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
            id, pr_name, pr_description, pr_sku, pr_status, created_at,
            categories ( cat_name ),
            offers ( off_name, off_discount_percentage ),
            product_photos ( photo_url, is_primary ),
            price_lists ( price, quantity )
        `)
        .eq('id', id)
        .single()

    if (error || !data) redirect('/admin/products')

    const product = data as ProductDetails
    const status = STATUS_CONFIG[product.pr_status]
    const photos = product.product_photos ?? []
    const primaryPhoto = photos.find(p => p.is_primary)?.photo_url ?? photos[0]?.photo_url ?? null
    const tiers = (product.price_lists ?? []).slice().sort((a, b) => a.quantity - b.quantity)

    return (
        <>
            <style>{`
                .details-grid {
                    display: grid;
                    grid-template-columns: 1.1fr 1fr;
                    gap: 16px;
                }
                .details-card {
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    background: linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.6));
                    padding: 16px;
                }
                @media (max-width: 900px) {
                    .details-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                    <a
                        href="/admin/products"
                        style={{
                            color: 'var(--gold-light)',
                            textDecoration: 'none',
                            fontSize: 12,
                            letterSpacing: '0.12em',
                            fontFamily: 'var(--font-display)',
                            textTransform: 'uppercase',
                        }}
                    >
                        Back to products
                    </a>
                    <a
                        href={`/admin/add-product?id=${product.id}`}
                        className="btn-gold"
                        style={{ textDecoration: 'none', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        Edit Product
                    </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div>
                        <h1
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(22px, 4vw, 30px)',
                                margin: 0,
                                color: 'var(--ivory)',
                            }}
                        >
                            {product.pr_name}
                        </h1>
                        <div style={{ color: 'var(--ivory-dim)', fontSize: 13, marginTop: 6 }}>
                            SKU: {product.pr_sku}
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '6px 12px',
                            borderRadius: 9999,
                            border: `1px solid ${status.color}`,
                            color: status.color,
                            background: status.bg,
                            fontSize: 12,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)',
                            marginLeft: 'auto',
                        }}
                    >
                        {status.label}
                    </div>
                </div>

                <div className="details-grid">
                    <div className="details-card">
                        <div
                            style={{
                                borderRadius: 14,
                                border: '1px solid var(--border-strong)',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.04)',
                                aspectRatio: '1/1',
                            }}
                        >
                            {primaryPhoto ? (
                                <img
                                    src={primaryPhoto}
                                    alt={product.pr_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 28, opacity: 0.4 }}>
                                    No Photo
                                </div>
                            )}
                        </div>

                        {photos.length > 1 && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                {photos.map(photo => (
                                    <div
                                        key={photo.photo_url}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        <img
                                            src={photo.photo_url}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: 16 }}>
                        <div className="details-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                            <InfoItem label="Category" value={product.categories?.cat_name ?? 'Unassigned'} />
                            <InfoItem label="Created" value={fmtDate(product.created_at)} />
                            <InfoItem label="Offer" value={product.offers ? `${product.offers.off_name} (${product.offers.off_discount_percentage}%)` : 'None'} />
                            <InfoItem label="Status" value={status.label} />
                        </div>

                        <div className="details-card">
                            <div
                                style={{
                                    fontSize: 11,
                                    color: 'var(--gold-muted)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'var(--font-display)',
                                    marginBottom: 10,
                                }}
                            >
                                Price Tiers
                            </div>
                            {tiers.length === 0 ? (
                                <div style={{ color: 'var(--ivory-dim)', fontSize: 13 }}>No price tiers yet.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {tiers.map(tier => (
                                        <div
                                            key={`${tier.quantity}-${tier.price}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                borderRadius: 10,
                                                border: '1px solid var(--border)',
                                                padding: '8px 10px',
                                                background: 'rgba(255,255,255,0.03)',
                                                fontSize: 13,
                                            }}
                                        >
                                            <span style={{ color: 'var(--ivory-dim)' }}>Qty {tier.quantity}</span>
                                            <span style={{ color: 'var(--gold)' }}>{fmtPrice(tier.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="details-card" style={{ marginTop: 16 }}>
                    <div
                        style={{
                            fontSize: 11,
                            color: 'var(--gold-muted)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)',
                            marginBottom: 10,
                        }}
                    >
                        Description
                    </div>
                    <div style={{ color: 'var(--ivory-dim)', fontSize: 13, lineHeight: 1.6 }}>
                        {product.pr_description?.trim() || 'No description provided.'}
                    </div>
                </div>
            </div>
        </>
    )
}
