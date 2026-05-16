'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { FieldLabel, Input, Textarea, StatusSelect, Section, Toast } from './ui'

import type { Category, Offer, ImageFile, PriceTier, ProductForm } from './types'
import { PriceTiers } from './Pricetiers'
import { ImageZone } from './Imagezone'
import { SearchableSelect } from './Searchableselect'

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

const uid = () => Math.random().toString(36).slice(2, 9)

const INITIAL_FORM: ProductForm = {
    pr_name: '', pr_description: '', pr_sku: '',
    cat_id: '', off_id: '', pr_status: 'ACTIVE',
}

// ─── Types for existing DB photos ─────────────────────────────────────────────
type ExistingPhoto = {
    id: string
    photo_url: string
    storage_path: string
    is_primary: boolean
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AddProducts() {
    const searchParams = useSearchParams()
    const productId = searchParams.get('id')
    const isEdit = !!productId;

    const router = useRouter();

    const [form, setForm] = useState<ProductForm>(INITIAL_FORM)
    const [images, setImages] = useState<ImageFile[]>([])
    const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
    const [photosToDelete, setPhotosToDelete] = useState<string[]>([]) // storage_paths
    const [tiers, setTiers] = useState<PriceTier[]>([{ id: uid(), price: '', quantity: '' }])
    const [categories, setCategories] = useState<Category[]>([])
    const [offers, setOffers] = useState<Offer[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [loadingProduct, setLoadingProduct] = useState(isEdit)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

    const set = (field: keyof ProductForm, val: string) =>
        setForm(f => ({ ...f, [field]: val }))

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 4000)
    }

    // ─── Load categories + offers ────────────────────────────────────────────
    useEffect(() => {
        supabase.from('categories').select('id, cat_name, cat_description')
            .eq('cat_status', 'ACTIVE')
            .then(({ data }) => setCategories(data ?? []))

        supabase.from('offers').select('id, off_name, off_discount_percentage, description, off_ends, off_status')
            .eq('off_status', 'ACTIVE')
            .then(({ data }) => setOffers(data ?? []))
    }, [])

    // ─── Load existing product when editing ──────────────────────────────────
    useEffect(() => {
        if (!isEdit) return

        async function loadProduct() {
            setLoadingProduct(true)
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        id, pr_name, pr_description, pr_sku, pr_status,
                        cat_id, off_id,
                        product_photos ( id, photo_url, storage_path, is_primary ),
                        price_lists ( id, price, quantity )
                    `)
                    .eq('id', productId)
                    .single()

                if (error || !data) {
                    showToast('Failed to load product', 'error')
                    return
                }

                setForm({
                    pr_name: data.pr_name ?? '',
                    pr_description: data.pr_description ?? '',
                    pr_sku: data.pr_sku ?? '',
                    cat_id: data.cat_id ?? '',
                    off_id: data.off_id ?? '',
                    pr_status: data.pr_status ?? 'ACTIVE',
                })

                setExistingPhotos(
                    (data.product_photos as ExistingPhoto[]) ?? []
                )

                const loadedTiers: PriceTier[] = (data.price_lists ?? []).map((t: PriceTier) => ({
                    id: t.id ?? uid(),
                    price: String(t.price),
                    quantity: String(t.quantity),
                }))
                setTiers(loadedTiers.length ? loadedTiers : [{ id: uid(), price: '', quantity: '' }])
            } finally {
                setLoadingProduct(false)
            }
        }

        loadProduct()
    }, [productId, isEdit])

    // ─── Remove an existing (saved) photo ────────────────────────────────────
    const removeExistingPhoto = (photo: ExistingPhoto) => {
        setPhotosToDelete(prev => [...prev, photo.storage_path])
        const next = existingPhotos.filter(p => p.id !== photo.id)
        // If we removed the primary, promote the first remaining
        if (photo.is_primary && next.length > 0) next[0].is_primary = true
        setExistingPhotos(next)
    }

    const setPrimaryExisting = (photoId: string) => {
        setExistingPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === photoId })))
        // Also unset primary on any new images
        setImages(prev => prev.map(img => ({ ...img, isPrimary: false })))
    }

    const setPrimaryNew = (imgId: string) => {
        setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === imgId })))
        // Also unset primary on existing photos
        setExistingPhotos(prev => prev.map(p => ({ ...p, is_primary: false })))
    }

    // ─── Inline image zone for existing photos ───────────────────────────────
    // We override the onChange from ImageZone to also clear existing primaries
    const handleNewImagesChange = (imgs: ImageFile[]) => {
        // If a new image is being set as primary, clear existing photo primaries
        const newPrimary = imgs.find(i => i.isPrimary)
        if (newPrimary) {
            setExistingPhotos(prev => prev.map(p => ({ ...p, is_primary: false })))
        }
        setImages(imgs)
    }

    // ─── Create category / offer ─────────────────────────────────────────────
    const handleCreateCategory = async (data: Record<string, string>) => {
        const { data: created, error } = await supabase
            .from('categories')
            .insert({ cat_name: data.cat_name, cat_description: data.cat_description || null, cat_status: 'ACTIVE' })
            .select('id, cat_name, cat_description')
            .single()
        if (error) throw new Error(error.message)
        setCategories(prev => [...prev, created])
        return { id: created.id, label: created.cat_name }
    }

    const handleCreateOffer = async (data: Record<string, string>) => {
        const parsedDiscount = Number.parseInt(data.off_discount_percentage, 10)
        const discount = Number.isFinite(parsedDiscount) ? parsedDiscount : 0

        const { data: created, error } = await supabase
            .from('offers')
            .insert({
                off_name: data.off_name.trim(),
                description: data.description?.trim() || null,
                off_discount_percentage: discount,
                off_ends: data.off_ends ? new Date(data.off_ends).toISOString() : null,
                off_status: data.off_status || 'ACTIVE',
            })
            .select('id, off_name, off_discount_percentage, off_ends, off_status')
            .single()
        if (error) throw new Error(error.message)
        setOffers(prev => [...prev, created])
        const statusLabel = created.off_status ? ` · ${created.off_status}` : ''
        return {
            id: created.id,
            label: created.off_name,
            sub: `${created.off_discount_percentage}% off${statusLabel}`,
        }
    }

    // ─── Submit: create or update ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.pr_name.trim()) return showToast('Product name is required', 'error')
        if (!form.cat_id) return showToast('Please select a category', 'error')
        if (!form.pr_sku.trim()) return showToast('SKU is required', 'error')
        if (tiers.some(t => !t.price || !t.quantity)) return showToast('Fill all price tier fields', 'error')

        setSubmitting(true)
        try {
            if (isEdit) {
                // ── UPDATE ──────────────────────────────────────────────────
                const { error: updateErr } = await supabase
                    .from('products')
                    .update({
                        pr_name: form.pr_name.trim(),
                        pr_description: form.pr_description.trim() || null,
                        pr_sku: form.pr_sku.trim(),
                        cat_id: form.cat_id,
                        off_id: form.off_id || null,
                        pr_status: form.pr_status,
                    })
                    .eq('id', productId)
                if (updateErr) throw new Error(updateErr.message)

                // Delete removed photos from storage + DB
                for (const path of photosToDelete) {
                    await supabase.storage.from('product-photos').remove([path])
                }
                if (photosToDelete.length) {
                    await supabase
                        .from('product_photos')
                        .delete()
                        .in('storage_path', photosToDelete)
                }

                // Update is_primary on remaining existing photos
                for (const photo of existingPhotos) {
                    await supabase
                        .from('product_photos')
                        .update({ is_primary: photo.is_primary })
                        .eq('id', photo.id)
                }

                // Replace price tiers: delete old, insert new
                await supabase.from('price_lists').delete().eq('product_id', productId)
                const { error: priceErr } = await supabase.from('price_lists').insert(
                    tiers.map(t => ({
                        product_id: productId,
                        price: parseFloat(t.price),
                        quantity: parseInt(t.quantity),
                    }))
                )
                if (priceErr) throw new Error(priceErr.message)

                // Upload new images
                for (const img of images) {
                    const ext = img.file.name.split('.').pop()
                    const path = `${productId}/${uid()}.${ext}`
                    const { error: uploadErr } = await supabase.storage
                        .from('product-photos')
                        .upload(path, img.file, { contentType: img.file.type })
                    if (uploadErr) throw new Error(uploadErr.message)

                    const { data: urlData } = supabase.storage.from('product-photos').getPublicUrl(path)
                    await supabase.from('product_photos').insert({
                        product_id: productId,
                        photo_url: urlData.publicUrl,
                        storage_path: path,
                        is_primary: img.isPrimary,
                    })
                }

                showToast('Product updated successfully!', 'success')
                // Small delay so toast is visible, then go back
                setTimeout(() => window.history.back(), 1200)

            } else {
                // ── CREATE ──────────────────────────────────────────────────
                const { data: product, error: productErr } = await supabase
                    .from('products')
                    .insert({
                        pr_name: form.pr_name.trim(),
                        pr_description: form.pr_description.trim() || null,
                        pr_sku: form.pr_sku.trim(),
                        cat_id: form.cat_id,
                        off_id: form.off_id || null,
                        pr_status: form.pr_status,
                    })
                    .select('id')
                    .single()
                if (productErr) throw new Error(productErr.message)

                const { error: priceErr } = await supabase.from('price_lists').insert(
                    tiers.map(t => ({
                        product_id: product.id,
                        price: parseFloat(t.price),
                        quantity: parseInt(t.quantity),
                    }))
                )
                if (priceErr) throw new Error(priceErr.message)

                for (const img of images) {
                    const ext = img.file.name.split('.').pop()
                    const path = `${product.id}/${uid()}.${ext}`
                    const { error: uploadErr } = await supabase.storage
                        .from('product-photos')
                        .upload(path, img.file, { contentType: img.file.type })
                    if (uploadErr) throw new Error(uploadErr.message)

                    const { data: urlData } = supabase.storage.from('product-photos').getPublicUrl(path)
                    await supabase.from('product_photos').insert({
                        product_id: product.id,
                        photo_url: urlData.publicUrl,
                        storage_path: path,
                        is_primary: img.isPrimary,
                    })
                }

                showToast('Product added successfully!', 'success')
                setForm(INITIAL_FORM)
                setTiers([{ id: uid(), price: '', quantity: '' }])
                setImages([])
                router.push('/admin/products') // Redirect to product list after creation
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    // ─── Loading state ────────────────────────────────────────────────────────
    if (loadingProduct) {
        return (
            <div style={{
                display: 'grid', placeItems: 'center',
                minHeight: '60vh', color: 'var(--ivory-dim)', fontSize: 14,
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--gold)',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    Loading product…
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <>
            <Toast toast={toast} />

            <style>{`
                .add-product-wrapper {
                    width: 100%;
                    max-width: 760px;
                    margin: 0 auto;
                    padding: 24px 16px 60px;
                    box-sizing: border-box;
                    overflow-x: hidden;
                }
                .two-col-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .two-col-grid-offer {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .existing-photos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
                    gap: 10px;
                    margin-bottom: 14px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 500px) {
                    .add-product-wrapper { padding: 16px 12px 60px; }
                    .two-col-grid,
                    .two-col-grid-offer { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="add-product-wrapper">
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display, Georgia, serif)',
                        fontSize: 'clamp(22px, 5vw, 32px)',
                        margin: 0, color: 'var(--ivory, #f5f0e8)',
                    }}>
                        {isEdit ? 'Edit Product' : 'Add Product'}
                    </h1>
                    <p style={{ color: 'var(--ivory-dim, #9e9e9e)', marginTop: 6, fontSize: 14 }}>
                        {isEdit
                            ? 'Update the details below to modify this product.'
                            : 'Fill in the details below to list a new product.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>

                    {/* Basic Info */}
                    <Section title="Basic Info">
                        <div style={{ display: 'grid', gap: 16 }}>
                            <div>
                                <FieldLabel required>Product Name</FieldLabel>
                                <Input placeholder="e.g. Premium Silk Abaya" value={form.pr_name}
                                    onChange={e => set('pr_name', e.target.value)} />
                            </div>

                            <div>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea placeholder="Describe the product…" value={form.pr_description}
                                    onChange={e => set('pr_description', e.target.value)} />
                            </div>

                            <div className="two-col-grid">
                                <div>
                                    <FieldLabel required>SKU</FieldLabel>
                                    <Input placeholder="e.g. SKU-001" value={form.pr_sku}
                                        onChange={e => set('pr_sku', e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel>Status</FieldLabel>
                                    <StatusSelect value={form.pr_status} onChange={v => set('pr_status', v)} />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Category & Offer */}
                    <Section title="Category & Offer">
                        <div className="two-col-grid-offer">
                            <SearchableSelect
                                label="Category"
                                required
                                value={form.cat_id}
                                onChange={v => set('cat_id', v)}
                                options={categories.map(c => ({ id: c.id, label: c.cat_name }))}
                                placeholder="Select category…"
                                addLabel="New Category"
                                onAdd={handleCreateCategory}
                                addFields={[
                                    { key: 'cat_name', label: 'Category Name', required: true, placeholder: 'e.g. Abayas' },
                                    { key: 'cat_description', label: 'Description', type: 'textarea', placeholder: 'Optional description…' },
                                ]}
                            />

                            <SearchableSelect
                                label="Offer"
                                value={form.off_id}
                                onChange={v => set('off_id', v)}
                                options={offers.map(o => ({
                                    id: o.id,
                                    label: o.off_name,
                                    sub: `${o.off_discount_percentage}% off${o.off_ends ? ` · ends ${new Date(o.off_ends).toLocaleDateString('en-BD')}` : ''}`,
                                }))}
                                placeholder="No offer (optional)…"
                                addLabel="New Offer"
                                onAdd={handleCreateOffer}
                                addFields={[
                                    { key: 'off_name', label: 'Offer Name', required: true, placeholder: 'e.g. Eid Special' },
                                    { key: 'off_discount_percentage', label: 'Discount %', required: true, placeholder: '10' },
                                    { key: 'off_ends', label: 'Expiry Date & Time', inputType: 'datetime-local', placeholder: 'Optional expiry' },
                                    {
                                        key: 'off_status',
                                        label: 'Status',
                                        type: 'select',
                                        options: [
                                            { value: 'ACTIVE', label: 'Active' },
                                            { value: 'INACTIVE', label: 'Inactive' },
                                        ],
                                    },
                                    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional…' },
                                ]}
                            />
                        </div>
                    </Section>

                    {/* Price Tiers */}
                    <Section title="Price Tiers">
                        <p style={{ color: 'var(--ivory-dim)', fontSize: 12, marginBottom: 14, marginTop: -6 }}>
                            Add multiple tiers for different quantities — e.g. 3ml = ৳500, 2ml = ৳450 each.
                        </p>
                        <PriceTiers tiers={tiers} onChange={setTiers} />
                    </Section>

                    {/* Images */}
                    <Section title="Product Images">

                        {/* Existing saved photos (edit mode only) */}
                        {isEdit && existingPhotos.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ color: 'var(--ivory-dim)', fontSize: 12, marginBottom: 10, marginTop: 0 }}>
                                    Saved photos — click to set as primary, ✕ to remove
                                </p>
                                <div className="existing-photos-grid">
                                    {existingPhotos.map(photo => (
                                        <div
                                            key={photo.id}
                                            title="Click to set as primary"
                                            onClick={() => setPrimaryExisting(photo.id)}
                                            style={{
                                                position: 'relative', borderRadius: 10, overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: photo.is_primary
                                                    ? '2px solid var(--gold)'
                                                    : '2px solid rgba(255,255,255,0.08)',
                                                transition: 'border-color .2s',
                                                boxShadow: photo.is_primary ? '0 0 0 3px rgba(212,175,55,0.18)' : 'none',
                                            }}
                                        >
                                            <img
                                                src={photo.photo_url}
                                                alt=""
                                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                                            />

                                            {photo.is_primary && (
                                                <div style={{
                                                    position: 'absolute', top: 5, left: 5,
                                                    background: 'var(--gold)', borderRadius: 4,
                                                    padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 3,
                                                }}>
                                                    <span style={{ fontSize: 8, fontWeight: 800, color: '#000', letterSpacing: '0.04em' }}>★ PRIMARY</span>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={e => { e.stopPropagation(); removeExistingPhoto(photo) }}
                                                style={{
                                                    position: 'absolute', top: 5, right: 5,
                                                    width: 20, height: 20, borderRadius: '50%', border: 'none',
                                                    background: 'rgba(0,0,0,0.75)', cursor: 'pointer',
                                                    display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)',
                                                }}
                                            >
                                                <span style={{ fontSize: 10, color: '#fff', lineHeight: 1 }}>✕</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New image upload zone */}
                        <ImageZone
                            images={images}
                            onChange={handleNewImagesChange}
                            // Override setPrimary to also clear existing photo primaries
                        />

                        {isEdit && (
                            <p style={{ color: 'var(--ivory-dim)', fontSize: 11, marginTop: 8 }}>
                                New uploads will be added alongside saved photos.
                            </p>
                        )}
                    </Section>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-gold"
                            style={{ opacity: submitting ? 0.7 : 1, minWidth: 150 }}
                        >
                            {submitting
                                ? (isEdit ? 'Saving…' : 'Adding…')
                                : (isEdit ? 'Save Changes' : 'Add Product')}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            style={{
                                padding: '10px 20px', borderRadius: 10,
                                border: '1.5px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--ivory-dim)', cursor: 'pointer', fontSize: 14,
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </>
    )
}