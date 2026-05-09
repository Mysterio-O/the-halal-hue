'use client'
import React from 'react'
import { Plus, X } from 'lucide-react'
import { Input, FieldLabel } from './ui'
import type { PriceTier } from './types'

const uid = () => Math.random().toString(36).slice(2, 9)

export function PriceTiers({ tiers, onChange }: {
    tiers: PriceTier[]
    onChange: (t: PriceTier[]) => void
}) {
    const add = () => onChange([...tiers, { id: uid(), price: '', quantity: '' }])
    const remove = (id: string) => onChange(tiers.filter(t => t.id !== id))
    const update = (id: string, field: 'price' | 'quantity', val: string) =>
        onChange(tiers.map(t => t.id === id ? { ...t, [field]: val } : t))

    return (
        <div style={{ width: '100%' }}>
            <style>{`
                .pt-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 42px;
                    gap: 10px;
                    margin-bottom: 6px;
                }
                .pt-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 42px;
                    gap: 10px;
                    align-items: center;
                    margin-bottom: 10px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .pt-mobile-label { display: none; }

                @media (max-width: 500px) {
                    .pt-header { display: none !important; }
                    .pt-row {
                        grid-template-columns: 1fr 36px !important;
                        grid-template-rows: auto auto;
                        gap: 8px;
                    }
                    .pt-field-price  { grid-column: 1; grid-row: 1; }
                    .pt-field-qty    { grid-column: 1; grid-row: 2; }
                    .pt-remove-btn   { grid-column: 2; grid-row: 1 / 3; align-self: center; width: 36px !important; height: 36px !important; }
                    .pt-mobile-label { display: block; }
                }
            `}</style>

            {tiers.length > 0 && (
                <div className="pt-header">
                    <FieldLabel>Price (৳)</FieldLabel>
                    <FieldLabel>Quantity</FieldLabel>
                    <span />
                </div>
            )}

            {tiers.map((tier) => (
                <div key={tier.id} className="pt-row">
                    <div className="pt-field-price">
                        <span className="pt-mobile-label"><FieldLabel>Price (৳)</FieldLabel></span>
                        <Input
                            type="number" min="0" step="0.01" placeholder="0.00"
                            value={tier.price}
                            onChange={e => update(tier.id, 'price', e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div className="pt-field-qty">
                        <span className="pt-mobile-label"><FieldLabel>Quantity</FieldLabel></span>
                        <Input
                            type="number" min="1" placeholder="1"
                            value={tier.quantity}
                            onChange={e => update(tier.id, 'quantity', e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="button"
                        className="pt-remove-btn"
                        onClick={() => remove(tier.id)}
                        disabled={tiers.length === 1}
                        title="Remove tier"
                        style={{
                            width: 42, height: 42, borderRadius: 10,
                            border: '1.5px solid var(--border)',
                            background: 'transparent',
                            cursor: tiers.length === 1 ? 'not-allowed' : 'pointer',
                            display: 'grid', placeItems: 'center',
                            transition: 'border-color .2s, color .2s',
                            opacity: tiers.length === 1 ? 0.3 : 1,
                        }}
                        onMouseEnter={e => {
                            if (tiers.length > 1) {
                                e.currentTarget.style.borderColor = '#ef4444'
                                e.currentTarget.style.color = '#ef4444'
                            }
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.color = 'inherit'
                        }}
                    >
                        <X size={14} color={tiers.length === 1 ? 'var(--border)' : 'currentColor'} />
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={add}
                style={{
                    width: '100%', padding: '10px', borderRadius: 10,
                    border: '1.5px dashed var(--border)', background: 'transparent',
                    color: 'var(--ivory-dim)', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, transition: 'border-color .2s, color .2s',
                    boxSizing: 'border-box',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--gold)'
                    e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--ivory-dim)'
                }}
            >
                <Plus size={14} /> Add Price Tier
            </button>
        </div>
    )
}