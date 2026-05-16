'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { FieldLabel, Input, Modal, StatusSelect, Textarea, Toast } from '@/components/add-product/ui'

type OfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED'

type OfferRow = {
    id: string
    off_name: string
    description: string | null
    off_discount_percentage: number | null
    off_ends: string | null
    off_status: OfferStatus
    created_at: string
    updated_at: string
}

type ProductRow = {
    id: string
    off_id: string | null
    pr_name: string
    pr_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    product_photos: { photo_url: string; is_primary: boolean }[]
    price_lists: { price: number; quantity: number }[]
}

type OfferProductPreview = {
    id: string
    pr_name: string
    primaryPhotoUrl: string | null
    lowestPrice: number | null
}

type OfferMetrics = {
    productCount: number
    activeProductCount: number
    previews: OfferProductPreview[]
}

type OfferForm = {
    off_name: string
    description: string
    off_discount_percentage: string
    off_ends: string
    off_status: OfferStatus
}

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const INITIAL_FORM: OfferForm = {
    off_name: '',
    description: '',
    off_discount_percentage: '',
    off_ends: '',
    off_status: 'ACTIVE',
}

function toDatetimeLocal(value: string | null) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function statusTheme(status: OfferStatus) {
    if (status === 'ACTIVE') return { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }
    if (status === 'INACTIVE') return { color: '#facc15', bg: 'rgba(250,204,21,0.12)' }
    return { color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
}

export default function OffersManagerClient() {
    const [offers, setOffers] = useState<OfferRow[]>([])
    const [metrics, setMetrics] = useState<Record<string, OfferMetrics>>({})
    const [loading, setLoading] = useState(true)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<OfferForm>(INITIAL_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

    const showToast = useCallback((msg: string, type: 'success' | 'error') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }, [])

    const fetchData = useCallback(async () => {
        const [{ data: offerRows, error: offerError }, { data: productRows, error: productError }] = await Promise.all([
            supabase
                .from('offers')
                .select('id, off_name, description, off_discount_percentage, off_ends, off_status, created_at, updated_at')
                .order('created_at', { ascending: false }),
            supabase
                .from('products')
                .select('id, off_id, pr_name, pr_status, product_photos ( photo_url, is_primary ), price_lists ( price, quantity )')
                .not('off_id', 'is', null),
        ])

        if (offerError) throw offerError
        if (productError) throw productError

        const nextMetrics: Record<string, OfferMetrics> = {}

        for (const product of (productRows ?? []) as ProductRow[]) {
            if (!product.off_id) continue

            const photos = Array.isArray(product.product_photos) ? product.product_photos : []
            const primaryPhoto = photos.find((p) => p.is_primary) ?? photos[0] ?? null
            const prices = Array.isArray(product.price_lists) ? product.price_lists : []
            const lowestPrice = prices.length ? Math.min(...prices.map((p) => Number(p.price))) : null

            if (!nextMetrics[product.off_id]) {
                nextMetrics[product.off_id] = { productCount: 0, activeProductCount: 0, previews: [] }
            }

            const entry = nextMetrics[product.off_id]
            entry.productCount += 1
            if (product.pr_status === 'ACTIVE') entry.activeProductCount += 1

            if (entry.previews.length < 3 && product.pr_status === 'ACTIVE') {
                entry.previews.push({
                    id: product.id,
                    pr_name: product.pr_name,
                    primaryPhotoUrl: primaryPhoto?.photo_url ?? null,
                    lowestPrice,
                })
            }
        }

        return {
            offerRows: (offerRows ?? []) as OfferRow[],
            nextMetrics,
        }
    }, [])

    const refreshData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true)
        try {
            const { offerRows, nextMetrics } = await fetchData()
            setOffers(offerRows)
            setMetrics(nextMetrics)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load offers'
            showToast(message, 'error')
        } finally {
            if (showLoader) setLoading(false)
        }
    }, [fetchData, showToast])

    useEffect(() => {
        let cancelled = false

        async function mountFetch() {
            try {
                const { offerRows, nextMetrics } = await fetchData()
                if (cancelled) return
                setOffers(offerRows)
                setMetrics(nextMetrics)
            } catch (error) {
                if (cancelled) return
                const message = error instanceof Error ? error.message : 'Failed to load offers'
                showToast(message, 'error')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        mountFetch()

        return () => {
            cancelled = true
        }
    }, [fetchData, showToast])

    const isEditing = !!editingId

    const headingMeta = useMemo(() => {
        const total = offers.length
        const active = offers.filter((offer) => offer.off_status === 'ACTIVE').length
        return { total, active }
    }, [offers])

    const openCreate = () => {
        setEditingId(null)
        setForm(INITIAL_FORM)
        setModalOpen(true)
    }

    const openEdit = (offer: OfferRow) => {
        setEditingId(offer.id)
        setForm({
            off_name: offer.off_name,
            description: offer.description ?? '',
            off_discount_percentage: String(offer.off_discount_percentage ?? ''),
            off_ends: toDatetimeLocal(offer.off_ends),
            off_status: offer.off_status,
        })
        setModalOpen(true)
    }

    const closeModal = () => {
        if (submitting) return
        setModalOpen(false)
        setEditingId(null)
        setForm(INITIAL_FORM)
    }

    const submitForm = async () => {
        const name = form.off_name.trim()
        if (!name) return showToast('Offer name is required', 'error')

        const discount = Number.parseInt(form.off_discount_percentage, 10)
        if (!Number.isFinite(discount) || discount < 0 || discount > 95) {
            return showToast('Discount must be between 0 and 95', 'error')
        }

        setSubmitting(true)
        try {
            const payload = {
                off_name: name,
                description: form.description.trim() || null,
                off_discount_percentage: discount,
                off_ends: form.off_ends ? new Date(form.off_ends).toISOString() : null,
                off_status: form.off_status,
            }

            if (editingId) {
                const { error } = await supabase.from('offers').update(payload).eq('id', editingId)
                if (error) throw error
                showToast('Offer updated', 'success')
            } else {
                const { error } = await supabase.from('offers').insert(payload)
                if (error) throw error
                showToast('Offer created', 'success')
            }

            closeModal()
            await refreshData()
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to save offer', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleStatus = async (offer: OfferRow) => {
        const nextStatus: OfferStatus = offer.off_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            const { error } = await supabase
                .from('offers')
                .update({ off_status: nextStatus })
                .eq('id', offer.id)

            if (error) throw error
            showToast(`Offer set to ${nextStatus}`, 'success')
            await refreshData()
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to toggle status', 'error')
        }
    }

    const deleteOffer = async (offer: OfferRow) => {
        const ok = window.confirm(`Delete "${offer.off_name}"? This will detach it from all linked products.`)
        if (!ok) return

        try {
            const { error: detachError } = await supabase
                .from('products')
                .update({ off_id: null })
                .eq('off_id', offer.id)

            if (detachError) throw detachError

            const { error } = await supabase.from('offers').delete().eq('id', offer.id)
            if (error) throw error

            showToast('Offer deleted', 'success')
            await refreshData()
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete offer', 'error')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--obsidian)' }}>
            <Toast toast={toast} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{ display: 'grid', gap: 22 , padding:'10px'}}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        <Link
                            href="/admin"
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.7rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--gold-muted)',
                                textDecoration: 'none',
                            }}
                        >
                            ← Back to Admin
                        </Link>

                        <h1
                            className="text-gold-gradient"
                            style={{
                                margin: '0.65rem 0 0.4rem',
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                letterSpacing: '0.04em',
                            }}
                        >
                            Offer Management
                        </h1>

                        <p style={{ margin: 0, color: 'var(--ivory-dim)', fontSize: 14 }}>
                            {headingMeta.active} active out of {headingMeta.total} total offers
                        </p>
                    </div>

                    <button className="btn-gold" type="button" onClick={openCreate}>
                        <Plus size={15} />
                        New Offer
                    </button>
                </div>

                {loading ? (
                    <div className="card-glass" style={{ borderRadius: 16, padding: 20, color: 'var(--ivory-dim)' }}>
                        Loading offers...
                    </div>
                ) : offers.length === 0 ? (
                    <div className="card-glass" style={{ borderRadius: 16, padding: 22 }}>
                        <p style={{ margin: 0, color: 'var(--ivory-dim)', fontSize: 14 }}>
                            No offers found. Create your first offer to start assigning discounts to products.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                            gap: 14,
                        }}
                    >
                        {offers.map((offer) => {
                            const stat = statusTheme(offer.off_status)
                            const metric = metrics[offer.id] ?? {
                                productCount: 0,
                                activeProductCount: 0,
                                previews: [],
                            }

                            return (
                                <article
                                    key={offer.id}
                                    className="card-glass"
                                    style={{
                                        borderRadius: 16,
                                        padding: 16,
                                        display: 'grid',
                                        gap: 11,
                                        border: '1px solid var(--border)',
                                        background: 'linear-gradient(135deg, rgba(107,15,15,0.35), rgba(61,10,10,0.6))',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h2
                                                style={{
                                                    margin: 0,
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: '1rem',
                                                    letterSpacing: '0.03em',
                                                    lineHeight: 1.2,
                                                    color: 'var(--ivory)',
                                                }}
                                            >
                                                {offer.off_name}
                                            </h2>
                                            <p
                                                style={{
                                                    margin: '0.35rem 0 0',
                                                    fontFamily: 'var(--font-display)',
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.66rem',
                                                    color: 'var(--gold-light)',
                                                }}
                                            >
                                                {offer.off_discount_percentage ?? 0}% OFF
                                            </p>
                                        </div>

                                        <span
                                            style={{
                                                height: 'fit-content',
                                                padding: '4px 9px',
                                                borderRadius: 9999,
                                                border: `1px solid ${stat.color}55`,
                                                color: stat.color,
                                                background: stat.bg,
                                                fontFamily: 'var(--font-display)',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                fontSize: '0.6rem',
                                            }}
                                        >
                                            {offer.off_status}
                                        </span>
                                    </div>

                                    {offer.description && (
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '0.85rem',
                                                lineHeight: 1.5,
                                                color: 'var(--ivory-dim)',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {offer.description}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        <span className="badge-halal badge-halal-sm">
                                            {metric.activeProductCount} active product{metric.activeProductCount === 1 ? '' : 's'}
                                        </span>
                                        <span
                                            style={{
                                                border: '1px solid var(--border)',
                                                borderRadius: 9999,
                                                padding: '4px 8px',
                                                fontSize: '0.62rem',
                                                color: 'var(--gold-muted)',
                                                fontFamily: 'var(--font-display)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                            }}
                                        >
                                            {metric.productCount} total linked
                                        </span>
                                        {offer.off_ends && (
                                            <span
                                                style={{
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 9999,
                                                    padding: '4px 8px',
                                                    fontSize: '0.62rem',
                                                    color: 'var(--ivory-dim)',
                                                    fontFamily: 'var(--font-display)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                Ends {new Date(offer.off_ends).toLocaleDateString('en-BD')}
                                            </span>
                                        )}
                                    </div>

                                    {metric.previews.length > 0 && (
                                        <div style={{ display: 'grid', gap: 7 }}>
                                            {metric.previews.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/perfumes/${product.id}`}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '38px 1fr auto',
                                                        gap: 8,
                                                        alignItems: 'center',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: 10,
                                                        padding: 5,
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: 8,
                                                            overflow: 'hidden',
                                                            position: 'relative',
                                                            background: 'rgba(61,10,10,0.8)',
                                                        }}
                                                    >
                                                        {product.primaryPhotoUrl ? (
                                                            <Image
                                                                src={product.primaryPhotoUrl}
                                                                alt={product.pr_name}
                                                                fill
                                                                sizes="38px"
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    display: 'grid',
                                                                    placeItems: 'center',
                                                                    color: 'var(--gold-muted)',
                                                                    fontFamily: 'var(--font-display)',
                                                                    fontSize: '0.65rem',
                                                                }}
                                                            >
                                                                ✦
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: '0.73rem',
                                                            color: 'var(--ivory)',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {product.pr_name}
                                                    </span>
                                                    {product.lowestPrice !== null && (
                                                        <span
                                                            style={{
                                                                fontFamily: 'var(--font-display)',
                                                                fontSize: '0.68rem',
                                                                color: 'var(--gold-light)',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            ৳{product.lowestPrice.toFixed(0)}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => openEdit(offer)}
                                            style={{
                                                border: '1px solid var(--border)',
                                                borderRadius: 10,
                                                background: 'rgba(255,255,255,0.03)',
                                                color: 'var(--ivory)',
                                                fontSize: 12,
                                                padding: '8px 10px',
                                                display: 'inline-flex',
                                                gap: 6,
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Pencil size={13} />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(offer)}
                                            style={{
                                                border: '1px solid var(--border)',
                                                borderRadius: 10,
                                                background: 'rgba(255,255,255,0.03)',
                                                color: 'var(--ivory)',
                                                fontSize: 12,
                                                padding: '8px 10px',
                                                display: 'inline-flex',
                                                gap: 6,
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Power size={13} />
                                            {offer.off_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteOffer(offer)}
                                            style={{
                                                border: '1px solid rgba(248,113,113,0.35)',
                                                borderRadius: 10,
                                                background: 'rgba(248,113,113,0.08)',
                                                color: '#f87171',
                                                fontSize: 12,
                                                padding: '8px 10px',
                                                display: 'inline-flex',
                                                gap: 6,
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Trash2 size={13} />
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>

            <Modal open={modalOpen} onClose={closeModal} title={isEditing ? 'Update Offer' : 'Create Offer'}>
                <div style={{ display: 'grid', gap: 13 }}>
                    <div>
                        <FieldLabel required>Offer Name</FieldLabel>
                        <Input
                            value={form.off_name}
                            onChange={(e) => setForm((prev) => ({ ...prev, off_name: e.target.value }))}
                            placeholder="e.g. Eid Mega Deal"
                        />
                    </div>

                    <div>
                        <FieldLabel required>Discount Percentage</FieldLabel>
                        <Input
                            type="number"
                            min={0}
                            max={95}
                            value={form.off_discount_percentage}
                            onChange={(e) => setForm((prev) => ({ ...prev, off_discount_percentage: e.target.value }))}
                            placeholder="e.g. 15"
                        />
                    </div>

                    <div>
                        <FieldLabel>Expiry Date & Time</FieldLabel>
                        <Input
                            type="datetime-local"
                            value={form.off_ends}
                            onChange={(e) => setForm((prev) => ({ ...prev, off_ends: e.target.value }))}
                        />
                    </div>

                    <div>
                        <FieldLabel>Status</FieldLabel>
                        <StatusSelect
                            value={form.off_status}
                            onChange={(v) => setForm((prev) => ({ ...prev, off_status: v as OfferStatus }))}
                        />
                    </div>

                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Add an optional offer description"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button
                            type="button"
                            className="btn-gold"
                            onClick={submitForm}
                            disabled={submitting}
                            style={{ opacity: submitting ? 0.7 : 1, flex: 1 }}
                        >
                            {submitting ? 'Saving...' : isEditing ? 'Update Offer' : 'Create Offer'}
                        </button>

                        <button
                            type="button"
                            onClick={closeModal}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 10,
                                border: '1.5px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--ivory-dim)',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
