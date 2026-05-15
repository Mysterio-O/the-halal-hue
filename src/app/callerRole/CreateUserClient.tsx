'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, ChevronLeft, Check, Shield, Users, Crown } from 'lucide-react'

type AllowedRole = 'SUPER_ADMIN' | 'ADMIN'
type CreatableRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'

// ─── Role options each caller can create ─────────────────────────────────────
const ROLE_OPTIONS: Record<AllowedRole, { value: CreatableRole; label: string; description: string; icon: React.ElementType }[]> = {
    SUPER_ADMIN: [
        { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full access to all features and settings', icon: Crown },
        { value: 'ADMIN', label: 'Admin', description: 'Can manage products, offers, and staff', icon: Shield },
        { value: 'MANAGER', label: 'Manager', description: 'Can manage products and view reports', icon: Users },
    ],
    ADMIN: [
        { value: 'MANAGER', label: 'Manager', description: 'Can manage products and view reports', icon: Users },
    ],
}

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
    if (!pw) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { score, label: 'Weak', color: '#f87171' }
    if (score <= 3) return { score, label: 'Fair', color: '#facc15' }
    return { score, label: 'Strong', color: '#4ade80' }
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({
    label, type = 'text', value, onChange, placeholder, required, suffix,
    error,
}: {
    label: string
    type?: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    required?: boolean
    suffix?: React.ReactNode
    error?: string
}) {
    const [focused, setFocused] = useState(false)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
                fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: 'var(--font-display)', color: 'var(--gold-muted)',
            }}>
                {label}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: suffix ? '11px 44px 11px 14px' : '11px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${error ? 'rgba(248,113,113,0.6)' : focused ? 'rgba(200,168,75,0.5)' : 'var(--border)'}`,
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--ivory)', fontSize: 14, outline: 'none',
                        fontFamily: 'var(--font-body)',
                        transition: 'border-color .2s',
                    }}
                />
                {suffix && (
                    <div style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    }}>
                        {suffix}
                    </div>
                )}
            </div>
            {error && (
                <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
            )}
        </div>
    )
}

// ─── Role selector card ───────────────────────────────────────────────────────
function RoleCard({
    option, selected, onClick,
}: {
    option: { value: CreatableRole; label: string; description: string; icon: React.ElementType }
    selected: boolean
    onClick: () => void
}) {
    const Icon = option.icon
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                border: `1.5px solid ${selected ? 'rgba(200,168,75,0.5)' : 'var(--border)'}`,
                background: selected
                    ? 'linear-gradient(135deg, rgba(200,168,75,0.1), rgba(61,10,10,0.6))'
                    : 'rgba(255,255,255,0.02)',
                transition: 'border-color .2s, background .2s',
                width: '100%',
            }}
            onMouseEnter={e => {
                if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,168,75,0.3)'
            }}
            onMouseLeave={e => {
                if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            }}
        >
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: selected ? 'rgba(200,168,75,0.15)' : 'rgba(107,15,15,0.5)',
                border: `1px solid ${selected ? 'rgba(200,168,75,0.3)' : 'var(--border)'}`,
                transition: 'all .2s',
            }}>
                <Icon size={16} color={selected ? 'var(--gold)' : 'var(--gold-muted)'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 13.5, fontWeight: 600,
                    color: selected ? 'var(--gold-light)' : 'var(--ivory)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                    marginBottom: 3,
                }}>
                    {option.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ivory-dim)', lineHeight: 1.4 }}>
                    {option.description}
                </div>
            </div>
            <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                border: `1.5px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
                background: selected ? 'var(--gold)' : 'transparent',
                display: 'grid', placeItems: 'center',
                transition: 'all .2s',
            }}>
                {selected && <Check size={10} color="var(--crimson-deep)" strokeWidth={3} />}
            </div>
        </button>
    )
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name, email, role, onAnother }: {
    name: string; email: string; role: string; onAnother: () => void
}) {
    const router = useRouter()
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '40px 0 20px', gap: 16,
            animation: 'fadeUp .4s ease both',
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(74,222,128,0.12)',
                border: '1.5px solid rgba(74,222,128,0.3)',
                display: 'grid', placeItems: 'center',
            }}>
                <Check size={28} color="#4ade80" />
            </div>
            <div>
                <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: 20,
                    color: 'var(--ivory)', margin: '0 0 8px', letterSpacing: '0.03em',
                }}>
                    User Created
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--ivory-dim)', margin: 0, lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--ivory)' }}>{name}</strong> has been added as a{' '}
                    <span style={{ color: 'var(--gold)' }}>{role}</span>.<br />
                    Their login is <span style={{ color: 'var(--gold-light)' }}>{email}</span>.
                </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                <button
                    type="button"
                    onClick={onAnother}
                    className="btn-gold"
                    style={{ fontSize: 13 }}
                >
                    <span>Add another user</span>
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    style={{
                        padding: '11px 22px', borderRadius: 9999, fontSize: 13, cursor: 'pointer',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--ivory-dim)', fontFamily: 'var(--font-display)',
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    )
}

// ─── Main form ────────────────────────────────────────────────────────────────
export default function CreateUserClient({ callerRole }: { callerRole: AllowedRole }) {
    const router = useRouter()
    const roleOptions = ROLE_OPTIONS[callerRole]

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [selectedRole, setSelectedRole] = useState<CreatableRole>(roleOptions[0].value)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [success, setSuccess] = useState<{ name: string; email: string; role: string } | null>(null)

    const strength = getStrength(password)

    function validate() {
        const errs: Record<string, string> = {}
        if (!fullName.trim()) errs.fullName = 'Full name is required'
        if (!email.trim()) errs.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address'
        if (!password) errs.password = 'Password is required'
        else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
        setFieldErrors(errs)
        return Object.keys(errs).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        if (!validate()) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    user_role: selectedRole,
                }),
            })

            const data = await res.json()
            if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

            setSuccess({
                name: fullName.trim(),
                email: email.trim().toLowerCase(),
                role: roleOptions.find(r => r.value === selectedRole)?.label ?? selectedRole,
            })
        } catch {
            setError('Network error — please try again')
        } finally {
            setSubmitting(false)
        }
    }

    function resetForm() {
        setFullName(''); setEmail(''); setPassword('')
        setSelectedRole(roleOptions[0].value)
        setError(null); setFieldErrors({}); setSuccess(null)
    }

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{
                maxWidth: 560, margin: '0 auto',
                padding: '32px 16px 72px', boxSizing: 'border-box',
            }}>
                {/* ── Back link ─────────────────────────────────────────────── */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--ivory-dim)', fontSize: 13,
                        fontFamily: 'var(--font-body)', marginBottom: 28,
                        padding: 0, transition: 'color .2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
                >
                    <ChevronLeft size={15} /> Back
                </button>

                {/* ── Card ──────────────────────────────────────────────────── */}
                <div style={{
                    borderRadius: 22, overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: 'linear-gradient(160deg, rgba(107,15,15,0.45) 0%, rgba(61,10,10,0.7) 100%)',
                    animation: 'fadeUp .4s ease both',
                }}>
                    {/* Header strip */}
                    <div style={{
                        padding: '24px 28px 20px',
                        borderBottom: '1px solid var(--border)',
                        background: 'rgba(200,168,75,0.04)',
                        display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 14,
                            display: 'grid', placeItems: 'center',
                            background: 'rgba(200,168,75,0.1)',
                            border: '1px solid rgba(200,168,75,0.25)',
                        }}>
                            <UserPlus size={20} color="var(--gold)" />
                        </div>
                        <div>
                            <h1 style={{
                                margin: 0, fontSize: 18, fontWeight: 600,
                                color: 'var(--ivory)', fontFamily: 'var(--font-display)',
                                letterSpacing: '0.03em',
                            }}>
                                Create User
                            </h1>
                            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ivory-dim)' }}>
                                Add a new team member to the admin panel
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '24px 28px 28px' }}>
                        {success ? (
                            <SuccessScreen
                                name={success.name}
                                email={success.email}
                                role={success.role}
                                onAnother={resetForm}
                            />
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                    {/* ── Role picker ───────────────────────── */}
                                    <div>
                                        <div style={{
                                            fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase',
                                            fontFamily: 'var(--font-display)', color: 'var(--gold-muted)',
                                            marginBottom: 10,
                                        }}>
                                            Role <span style={{ color: '#f87171' }}>*</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {roleOptions.map(opt => (
                                                <RoleCard
                                                    key={opt.value}
                                                    option={opt}
                                                    selected={selectedRole === opt.value}
                                                    onClick={() => setSelectedRole(opt.value)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Divider ───────────────────────────── */}
                                    <div style={{ height: 1, background: 'var(--border)' }} />

                                    {/* ── Full name ─────────────────────────── */}
                                    <Field
                                        label="Full Name"
                                        value={fullName}
                                        onChange={v => { setFullName(v); setFieldErrors(p => ({ ...p, fullName: '' })) }}
                                        placeholder="e.g. Arif Hossain"
                                        required
                                        error={fieldErrors.fullName}
                                    />

                                    {/* ── Email ─────────────────────────────── */}
                                    <Field
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: '' })) }}
                                        placeholder="arif@thehalalh.ue"
                                        required
                                        error={fieldErrors.email}
                                    />

                                    {/* ── Password ──────────────────────────── */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <Field
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: '' })) }}
                                            placeholder="Min. 8 characters"
                                            required
                                            error={fieldErrors.password}
                                            suffix={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(v => !v)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ivory-dim)', display: 'grid', placeItems: 'center' }}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            }
                                        />

                                        {/* Strength bar */}
                                        {password.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 3, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: 9999,
                                                        width: `${(strength.score / 5) * 100}%`,
                                                        background: strength.color,
                                                        transition: 'width .3s, background .3s',
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: 11, color: strength.color, minWidth: 38, fontWeight: 600 }}>
                                                    {strength.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── API error ─────────────────────────── */}
                                    {error && (
                                        <div style={{
                                            padding: '12px 14px', borderRadius: 10, fontSize: 13,
                                            border: '1px solid rgba(248,113,113,0.3)',
                                            background: 'rgba(248,113,113,0.08)',
                                            color: '#f87171',
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    {/* ── Submit ────────────────────────────── */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-gold"
                                        style={{
                                            width: '100%', fontSize: 14,
                                            opacity: submitting ? 0.7 : 1,
                                            cursor: submitting ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                            {submitting ? (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                                    </svg>
                                                    Creating…
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={15} />
                                                    Create {roleOptions.find(r => r.value === selectedRole)?.label}
                                                </>
                                            )}
                                        </span>
                                    </button>

                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </>
    )
}