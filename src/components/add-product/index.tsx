'use client'
import React, { useState, useEffect } from 'react'
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AddProducts() {
    const [form, setForm] = useState<ProductForm>(INITIAL_FORM)
    const [images, setImages] = useState<ImageFile[]>([])
    const [tiers, setTiers] = useState<PriceTier[]>([{ id: uid(), price: '', quantity: '' }])
    const [categories, setCategories] = useState<Category[]>([])
    const [offers, setOffers] = useState<Offer[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

    const set = (field: keyof ProductForm, val: string) =>
        setForm(f => ({ ...f, [field]: val }))

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 4000)
    }

    useEffect(() => {
        supabase.from('categories').select('id, cat_name, cat_description')
            .eq('cat_status', 'ACTIVE')
            .then(({ data }) => setCategories(data ?? []))

        supabase.from('offers').select('id, off_name, off_discount_percentage, description')
            .eq('off_status', 'ACTIVE')
            .then(({ data }) => setOffers(data ?? []))
    }, [])

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
        const { data: created, error } = await supabase
            .from('offers')
            .insert({
                off_name: data.off_name,
                description: data.description || null,
                off_discount_percentage: parseInt(data.off_discount_percentage) || 0,
                off_status: 'ACTIVE',
            })
            .select('id, off_name, off_discount_percentage')
            .single()
        if (error) throw new Error(error.message)
        setOffers(prev => [...prev, created])
        return { id: created.id, label: created.off_name, sub: `${created.off_discount_percentage}% off` }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.pr_name.trim()) return showToast('Product name is required', 'error')
        if (!form.cat_id) return showToast('Please select a category', 'error')
        if (!form.pr_sku.trim()) return showToast('SKU is required', 'error')
        if (tiers.some(t => !t.price || !t.quantity)) return showToast('Fill all price tier fields', 'error')

        setSubmitting(true)
        try {
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
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
        } finally {
            setSubmitting(false)
        }
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
                @media (max-width: 500px) {
                    .add-product-wrapper {
                        padding: 16px 12px 60px;
                    }
                    .two-col-grid,
                    .two-col-grid-offer {
                        grid-template-columns: 1fr !important;
                    }
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
                        Add Product
                    </h1>
                    <p style={{ color: 'var(--ivory-dim, #9e9e9e)', marginTop: 6, fontSize: 14 }}>
                        Fill in the details below to list a new product.
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
                                    sub: `${o.off_discount_percentage}% off`,
                                }))}
                                placeholder="No offer (optional)…"
                                addLabel="New Offer"
                                onAdd={handleCreateOffer}
                                addFields={[
                                    { key: 'off_name', label: 'Offer Name', required: true, placeholder: 'e.g. Eid Special' },
                                    { key: 'off_discount_percentage', label: 'Discount %', required: true, placeholder: '10' },
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
                        <ImageZone images={images} onChange={setImages} />
                    </Section>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button type="submit" disabled={submitting} className="btn-gold"
                            style={{ opacity: 1, minWidth: 150 }}>
                            {submitting ? 'Saving…' : 'Add Product'}
                        </button>
                        <button type="button" onClick={() => window.history.back()}
                            style={{
                                padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--border)',
                                background: '', color: 'var(--ivory-dim)', cursor: 'pointer', fontSize: 14,
                            }}>
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </>
    )
}