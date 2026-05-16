'use client'
import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { FieldLabel, Input, Textarea, Modal } from './ui'

// ─── Types ────────────────────────────────────────────────────────────────────
type Option = { id: string; label: string; sub?: string }

type SearchableSelectProps = {
    label: string
    required?: boolean
    options: Option[]
    value: string
    onChange: (id: string) => void
    placeholder?: string
    addLabel: string
    addFields: AddField[]
    onAdd: (data: Record<string, string>) => Promise<{ id: string; label: string; sub?: string }>
}

type AddField = {
    key: string
    label: string
    required?: boolean
    type?: 'input' | 'textarea' | 'select'
    inputType?: React.HTMLInputTypeAttribute
    placeholder?: string
    options?: { value: string; label: string }[]
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────
export function SearchableSelect({
    label, required, options, value, onChange,
    placeholder = 'Select…', addLabel, addFields, onAdd,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const selected = options.find(o => o.id === value)
    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase())
    )

    const handleAdd = async () => {
        setError('')
        const missing = addFields.find(f => f.required && !formData[f.key]?.trim())
        if (missing) { setError(`${missing.label} is required`); return }
        setSaving(true)
        try {
            const created = await onAdd(formData)
            onChange(created.id)
            setModalOpen(false)
            setFormData({})
            setOpen(false)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <div style={{ width: '100%', minWidth: 0 }}>
                <FieldLabel required={required}>{label}</FieldLabel>

                {/* Trigger row: dropdown takes all space, + button fixed width */}
                <div style={{ display: 'flex', gap: 8, width: '100%', minWidth: 0 }}>
                    <Popover open={open} onOpenChange={setOpen}>
                        {/* flex:1 + minWidth:0 makes the trigger fill available space */}
                        <PopoverTrigger style={{ flex: 1, minWidth: 0 }}>
                            <div
                                // type="button"
                                style={{
                                    width: '100%',
                                    minWidth: 0,
                                    padding: '11px 12px',
                                    borderRadius: 10,
                                    boxSizing: 'border-box',
                                    border: '1.5px solid var(--border)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: selected ? 'var(--ivory)' : 'var(--ivory-dim)',
                                    fontSize: 14,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'border-color .2s',
                                    gap: 6,
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                                    {selected ? (
                                        <>
                                            {selected.label}
                                            {selected.sub && (
                                                <span style={{ color: 'var(--ivory-dim)', fontSize: 12, marginLeft: 6 }}>
                                                    {selected.sub}
                                                </span>
                                            )}
                                        </>
                                    ) : placeholder}
                                </span>
                                <ChevronsUpDown size={14} color="var(--ivory-dim)" style={{ flexShrink: 0 }} />
                            </div>
                        </PopoverTrigger>

                        <PopoverContent
                            style={{
                                width: 'var(--radix-popover-trigger-width)',
                                padding: 0,
                                borderRadius: 12,
                                border: '1px solid var(--border)',
                                background: '#0e0e0e',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Search */}
                            <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={13} color="var(--ivory-dim)" style={{
                                        position: 'absolute', left: 10, top: '50%',
                                        transform: 'translateY(-50%)', pointerEvents: 'none',
                                    }} />
                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search…"
                                        style={{
                                            width: '100%', padding: '8px 10px 8px 30px',
                                            borderRadius: 8, boxSizing: 'border-box',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--ivory)', fontSize: 13, outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '6px' }}>
                                {filtered.length === 0 ? (
                                    <div style={{ padding: '12px 10px', fontSize: 13, color: 'var(--ivory-dim)', textAlign: 'center' }}>
                                        No results
                                    </div>
                                ) : filtered.map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => { onChange(opt.id); setOpen(false); setSearch('') }}
                                        style={{
                                            width: '100%', padding: '9px 10px', borderRadius: 8,
                                            border: 'none',
                                            background: value === opt.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                                            color: 'var(--ivory)', fontSize: 13, cursor: 'pointer',
                                            textAlign: 'left', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', gap: 8, transition: 'background .15s',
                                        }}
                                        onMouseEnter={e => { if (value !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                        onMouseLeave={e => { if (value !== opt.id) e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <span>
                                            {opt.label}
                                            {opt.sub && <span style={{ color: 'var(--ivory-dim)', fontSize: 11, marginLeft: 6 }}>{opt.sub}</span>}
                                        </span>
                                        {value === opt.id && <Check size={13} color="var(--gold)" />}
                                    </button>
                                ))}
                            </div>

                            {/* Add new */}
                            <div style={{ padding: '6px 6px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <button
                                    type="button"
                                    onClick={() => { setModalOpen(true); setOpen(false) }}
                                    style={{
                                        width: '100%', padding: '9px 10px', borderRadius: 8,
                                        border: 'none', background: 'transparent',
                                        color: 'var(--gold)', fontSize: 13, cursor: 'pointer',
                                        textAlign: 'left', display: 'flex', alignItems: 'center',
                                        gap: 7, transition: 'background .15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                >
                                    <Plus size={14} /> {addLabel}
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Quick-add button — fixed 44px, never shrinks */}
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        title={addLabel}
                        style={{
                            flexShrink: 0,
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: '1.5px solid var(--border)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'var(--ivory-dim)',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                            transition: 'border-color .2s, color .2s',
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
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Add Modal */}
            <Modal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setFormData({}); setError('') }}
                title={addLabel}
            >
                <div style={{ display: 'grid', gap: 14 }}>
                    {addFields.map(field => (
                        <div key={field.key}>
                            <FieldLabel required={field.required}>{field.label}</FieldLabel>
                            {field.type === 'textarea' ? (
                                <Textarea
                                    placeholder={field.placeholder}
                                    value={formData[field.key] ?? ''}
                                    onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                                />
                            ) : field.type === 'select' ? (
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={formData[field.key] ?? ''}
                                        onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '11px 36px 11px 14px',
                                            borderRadius: 10, boxSizing: 'border-box',
                                            border: '1.5px solid var(--border)',
                                            background: 'rgba(255,255,255,0.04)',
                                            color: 'var(--ivory)', fontSize: 14,
                                            outline: 'none', appearance: 'none', cursor: 'pointer',
                                        }}
                                    >
                                        {field.options?.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="var(--ivory-dim)" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            ) : (
                                <Input
                                    type={field.inputType ?? 'text'}
                                    placeholder={field.placeholder}
                                    value={formData[field.key] ?? ''}
                                    onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                                />
                            )}
                        </div>
                    ))}

                    {error && (
                        <div style={{
                            fontSize: 13, color: '#f87171', padding: '8px 12px',
                            borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={saving}
                            className="btn-gold"
                            style={{ opacity: saving ? 0.7 : 1, flex: 1 }}
                        >
                            {saving ? 'Creating…' : 'Create & Select'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setModalOpen(false); setFormData({}); setError('') }}
                            style={{
                                padding: '10px 18px', borderRadius: 10,
                                border: '1.5px solid var(--border)',
                                background: 'transparent', color: 'var(--ivory-dim)',
                                cursor: 'pointer', fontSize: 14,
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}