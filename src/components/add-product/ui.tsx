'use client'
import React, { useState, useRef, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

// ─── FieldLabel ───────────────────────────────────────────────────────────────
export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label style={{
            display: 'block', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--ivory-dim)', marginBottom: 6,
        }}>
            {children}
            {required && <span style={{ color: 'var(--gold)', marginLeft: 3 }}>*</span>}
        </label>
    )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                boxSizing: 'border-box', border: '1.5px solid var(--border)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--ivory)',
                fontSize: 14, outline: 'none', transition: 'border-color .2s',
                ...props.style,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
    )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                boxSizing: 'border-box', border: '1.5px solid var(--border)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--ivory)',
                fontSize: 14, outline: 'none', resize: 'vertical',
                minHeight: 90, fontFamily: 'inherit', transition: 'border-color .2s',
                ...props.style,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
    )
}

// ─── StatusSelect ─────────────────────────────────────────────────────────────
// Fully custom — no native <select> — so it matches the dark theme perfectly.

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active', dot: '#4ade80' },
    { value: 'INACTIVE', label: 'Inactive', dot: '#facc15' },
    { value: 'ARCHIVED', label: 'Archived', dot: '#94a3b8' },
]

export function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const current = STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[0]

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', padding: '11px 36px 11px 36px', borderRadius: 10,
                    boxSizing: 'border-box', border: `1.5px solid ${open ? 'var(--gold)' : 'var(--border)'}`,
                    background: 'rgba(255,255,255,0.04)', color: 'var(--ivory)',
                    fontSize: 14, outline: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color .2s', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Status dot */}
                <span style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    width: 8, height: 8, borderRadius: '50%', background: current.dot,
                    flexShrink: 0,
                }} />

                <span style={{ paddingLeft: 4 }}>{current.label}</span>

                {/* Chevron */}
                <svg
                    style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--ivory-dim)" strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    zIndex: 9999, borderRadius: 10, overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: 'rgba(14, 6, 6, 0.97)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                }}>
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false) }}
                            style={{
                                width: '100%', padding: '10px 14px', border: 'none',
                                background: value === opt.value
                                    ? 'rgba(200,168,75,0.10)'
                                    : 'transparent',
                                color: 'var(--ivory)', fontSize: 14,
                                cursor: 'pointer', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: 10,
                                transition: 'background .15s',
                            }}
                            onMouseEnter={e => {
                                if (value !== opt.value)
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                            }}
                            onMouseLeave={e => {
                                if (value !== opt.value)
                                    e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            {/* Dot */}
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: opt.dot, flexShrink: 0,
                                boxShadow: value === opt.value ? `0 0 6px ${opt.dot}` : 'none',
                            }} />
                            {opt.label}
                            {/* Active checkmark */}
                            {value === opt.value && (
                                <svg style={{ marginLeft: 'auto' }} width="13" height="13"
                                    viewBox="0 0 24 24" fill="none"
                                    stroke="var(--gold)" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div
            className="card-glass"
            style={{
                padding: '20px 20px 22px',
                borderRadius: 14,
                overflow: 'hidden',   // ← prevents any child from bleeding out
                minWidth: 0,          // ← lets the card shrink below its content's natural width
            }}
        >
            <h2 style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--gold, #d4af37)', margin: '0 0 18px',
            }}>
                {title}
            </h2>
            {children}
        </div>
    )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ toast }: { toast: { msg: string; type: 'success' | 'error' } | null }) {
    if (!toast) return null
    const isSuccess = toast.type === 'success'
    return (
        <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 10,
            background: isSuccess ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isSuccess ? '#22c55e44' : '#ef444444'}`,
            color: isSuccess ? '#4ade80' : '#f87171',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 340,
            backdropFilter: 'blur(12px)',
        }}>
            {isSuccess
                ? <CheckCircle size={16} color="#4ade80" />
                : <XCircle size={16} color="#f87171" />}
            {toast.msg}
        </div>
    )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
    open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
    if (!open) return null
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'grid', placeItems: 'center', padding: 16,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 440, borderRadius: 16,
                    border: '1px solid var(--border)', background: 'var(--surface, #111)',
                    padding: '24px 24px 20px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--ivory)' }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'var(--ivory-dim)',
                        cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4,
                    }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}