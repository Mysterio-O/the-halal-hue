'use client'
import React, { useEffect, useState } from 'react'
import {
    Package, Tag, Percent, Users,
    TrendingUp, AlertCircle, Clock, Star,
    BarChart3, ArrowUpRight, Flame, Eye,
} from 'lucide-react'
import { getBrowserSupabase } from '@/utils/supabase/browser'

// ─── Supabase ─────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────
type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'

type RecentProduct = {
    id: string
    pr_name: string
    pr_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    pr_sku: string
    created_at: string
    cat_name: string | null
    lowest_price: number | null
    primary_photo: string | null
}

type TopCategory = { cat_name: string; product_count: number }

type ActiveOffer = {
    id: string
    off_name: string
    off_discount_percentage: number
    off_ends: string | null
    product_count: number
}

type StatusBreakdown = { pr_status: string; count: number }

type DashboardStats = {
    total_products: number
    active_products: number
    inactive_products: number
    archived_products: number
    total_categories: number
    active_categories: number
    total_offers: number
    active_offers: number
    total_users: number
    active_users: number
    avg_product_price: number | null
    min_price: number | null
    max_price: number | null
    unpriced_products: number
    unphoto_products: number
    new_products_7d: number
    new_products_30d: number
    top_categories: TopCategory[]
    recent_products: RecentProduct[]
    active_offer_list: ActiveOffer[]
    status_breakdown: StatusBreakdown[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined) =>
    n == null ? '—' : n.toLocaleString('en-BD')

const fmtPrice = (n: number | null | undefined) =>
    n == null ? '—' : `৳${n.toLocaleString('en-BD')}`

const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: '#4ade80',
    INACTIVE: '#facc15',
    ARCHIVED: '#94a3b8',
}

const ROLE_LABEL: Record<AppRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: r,
            background: 'linear-gradient(90deg, rgba(200,168,75,0.04) 0px, rgba(200,168,75,0.09) 80px, rgba(200,168,75,0.04) 160px)',
            backgroundSize: '400px 100%',
            animation: 'shimmer 1.6s ease-in-out infinite',
        }} />
    )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    label, value, sub, icon: Icon, accent = false, trend,
}: {
    label: string
    value: string | number
    sub?: string
    icon: React.ElementType
    accent?: boolean
    trend?: { value: number; label: string }
}) {
    return (
        <div
            style={{
                position: 'relative',
                borderRadius: 18,
                padding: '1.4rem 1.5rem',
                border: `1px solid ${accent ? 'rgba(200,168,75,0.35)' : 'var(--border)'}`,
                background: accent
                    ? 'linear-gradient(135deg, rgba(200,168,75,0.10) 0%, rgba(61,10,10,0.7) 100%)'
                    : 'linear-gradient(135deg, rgba(107,15,15,0.38) 0%, rgba(61,10,10,0.6) 100%)',
                overflow: 'hidden',
                transition: 'transform .2s, box-shadow .2s, border-color .2s',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(200,168,75,0.25)'
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
            }}
        >
            {/* Glow orb */}
            <div style={{
                position: 'absolute', top: -24, right: -24,
                width: 80, height: 80, borderRadius: '50%',
                background: accent
                    ? 'radial-gradient(circle, rgba(200,168,75,0.18), transparent 70%)'
                    : 'radial-gradient(circle, rgba(107,15,15,0.4), transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    display: 'grid', placeItems: 'center',
                    background: accent ? 'rgba(200,168,75,0.15)' : 'rgba(107,15,15,0.5)',
                    border: `1px solid ${accent ? 'rgba(200,168,75,0.3)' : 'var(--border)'}`,
                }}>
                    <Icon size={18} color={accent ? 'var(--gold)' : 'var(--gold-muted)'} />
                </div>

                {trend && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 3,
                        fontSize: 11, color: trend.value >= 0 ? '#4ade80' : '#f87171',
                        background: trend.value >= 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        padding: '3px 8px', borderRadius: 20,
                    }}>
                        <ArrowUpRight size={11} />
                        {trend.label}
                    </div>
                )}
            </div>

            <div style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 700,
                color: accent ? 'var(--gold-light)' : 'var(--ivory)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
                lineHeight: 1,
                marginBottom: 6,
            }}>
                {value}
            </div>

            <div style={{
                fontSize: 12, color: 'var(--ivory-dim)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
            }}>
                {label}
            </div>

            {sub && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(249,243,232,0.4)', lineHeight: 1.4 }}>
                    {sub}
                </div>
            )}
        </div>
    )
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
                width: 28, height: 28, borderRadius: 8,
                display: 'grid', placeItems: 'center',
                background: 'rgba(200,168,75,0.1)',
                border: '1px solid rgba(200,168,75,0.2)',
            }}>
                <Icon size={14} color="var(--gold)" />
            </div>
            <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gold-muted)',
            }}>
                {label}
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200,168,75,0.15), transparent)' }} />
        </div>
    )
}

// ─── Category Bar Chart ───────────────────────────────────────────────────────
function CategoryBars({ data, loading }: { data: TopCategory[]; loading: boolean }) {
    const max = Math.max(...(data.map(d => d.product_count) ?? [1]), 1)

    return (
        <div style={{
            borderRadius: 18, padding: '1.4rem 1.5rem',
            border: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.6))',
        }}>
            <SectionHead icon={BarChart3} label="Top Categories" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <Sk w="50%" h={11} />
                            <Sk w="100%" h={8} r={4} />
                        </div>
                    ))
                    : data.map((cat, i) => {
                        const pct = Math.round((cat.product_count / max) * 100)
                        return (
                            <div key={cat.cat_name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: 12.5, color: 'var(--ivory)', fontWeight: 500 }}>{cat.cat_name}</span>
                                    <span style={{ fontSize: 12, color: 'var(--gold-muted)' }}>{cat.product_count}</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 9999,
                                        width: `${pct}%`,
                                        background: i === 0
                                            ? 'linear-gradient(90deg, var(--gold-muted), var(--gold-light))'
                                            : i === 1
                                                ? 'linear-gradient(90deg, var(--garnet), var(--crimson))'
                                                : 'rgba(200,168,75,0.35)',
                                        transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
                                    }} />
                                </div>
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

// ─── Status Donut (pure CSS conic-gradient) ───────────────────────────────────
function StatusDonut({ data, total, loading }: { data: StatusBreakdown[]; total: number; loading: boolean }) {
    const colors: Record<string, string> = {
        ACTIVE: '#4ade80',
        INACTIVE: '#facc15',
        ARCHIVED: '#94a3b8',
    }

    const segments = data.reduce<{ status: string; count: number; pct: number; start: number }[]>(
        (acc, d) => {
            const pct = total > 0 ? (d.count / total) * 100 : 0
            const start = acc.length > 0 ? acc[acc.length - 1].start + acc[acc.length - 1].pct : 0
            return [...acc, { status: d.pr_status, count: d.count, pct, start }]
        },
        []
    )

    const gradient = segments
        .map(s => `${colors[s.status] ?? '#888'} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
        .join(', ')

    return (
        <div style={{
            borderRadius: 18, padding: '1.4rem 1.5rem',
            border: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.6))',
        }}>
            <SectionHead icon={Eye} label="Product Status" />
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                    <Sk w={120} h={120} r={60} />
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                        <div style={{
                            width: 100, height: 100, borderRadius: '50%',
                            background: `conic-gradient(${gradient || '#333 0% 100%'})`,
                        }} />
                        <div style={{
                            position: 'absolute', inset: 16, borderRadius: '50%',
                            background: 'rgba(13,4,4,0.92)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ivory)', fontFamily: 'var(--font-display)' }}>
                                {total}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {segments.map(s => (
                            <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: colors[s.status] ?? '#888', flexShrink: 0,
                                    boxShadow: `0 0 6px ${colors[s.status]}66`,
                                }} />
                                <span style={{ fontSize: 12, color: 'var(--ivory-dim)' }}>{s.status}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ivory)', marginLeft: 'auto', paddingLeft: 12 }}>{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Recent Products ──────────────────────────────────────────────────────────
function RecentProducts({ data, loading }: { data: RecentProduct[]; loading: boolean }) {
    return (
        <div style={{
            borderRadius: 18, padding: '1.4rem 1.5rem',
            border: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.6))',
        }}>
            <SectionHead icon={Clock} label="Recently Added" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <Sk w={36} h={36} r={8} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Sk w="55%" h={12} />
                                <Sk w="35%" h={10} />
                            </div>
                            <Sk w={60} h={22} r={9999} />
                        </div>
                    ))
                    : data.map((p, i) => (
                        <div key={p.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 0',
                            borderBottom: i < data.length - 1 ? '1px solid rgba(200,168,75,0.07)' : 'none',
                            animation: `fadeUp .3s ease both`,
                            animationDelay: `${i * 0.05}s`,
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                overflow: 'hidden', display: 'grid', placeItems: 'center',
                            }}>
                                {p.primary_photo
                                    ? <img src={p.primary_photo} alt={p.pr_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontSize: 16, opacity: 0.4 }}>📦</span>
                                }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 13.5, fontWeight: 600, color: 'var(--ivory)',
                                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                }}>
                                    {p.pr_name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--ivory-dim)', marginTop: 2 }}>
                                    {p.cat_name ?? '—'} · {p.pr_sku} · {timeAgo(p.created_at)}
                                </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                                {fmtPrice(p.lowest_price)}
                            </div>
                            <div style={{
                                padding: '3px 10px', borderRadius: 9999, fontSize: 10,
                                fontWeight: 700, flexShrink: 0, letterSpacing: '0.06em',
                                color: STATUS_COLOR[p.pr_status] ?? '#888',
                                background: `${STATUS_COLOR[p.pr_status] ?? '#888'}18`,
                                border: `1px solid ${STATUS_COLOR[p.pr_status] ?? '#888'}33`,
                            }}>
                                {p.pr_status}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}

// ─── Active Offers ────────────────────────────────────────────────────────────
function ActiveOffers({ data, loading }: { data: ActiveOffer[]; loading: boolean }) {
    return (
        <div style={{
            borderRadius: 18, padding: '1.4rem 1.5rem',
            border: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.6))',
        }}>
            <SectionHead icon={Flame} label="Active Offers" />
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                        <Sk w="65%" h={13} />
                        <div style={{ marginTop: 6 }}><Sk w="40%" h={10} /></div>
                    </div>
                ))
            ) : data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ivory-dim)', fontSize: 13 }}>
                    No active offers
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.map((o, i) => (
                        <div key={o.id} style={{
                            padding: '12px 14px', borderRadius: 12,
                            border: '1px solid rgba(200,168,75,0.12)',
                            background: 'rgba(200,168,75,0.04)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                            animation: `fadeUp .3s ease both`,
                            animationDelay: `${i * 0.06}s`,
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ivory)', marginBottom: 4 }}>{o.off_name}</div>
                                <div style={{ fontSize: 11, color: 'var(--ivory-dim)' }}>
                                    {o.product_count} product{o.product_count !== 1 ? 's' : ''}
                                    {o.off_ends ? ` · Ends ${new Date(o.off_ends).toLocaleDateString('en-BD')}` : ''}
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 12px', borderRadius: 9999, flexShrink: 0,
                                background: 'linear-gradient(135deg, var(--gold-muted), var(--gold))',
                                color: 'var(--crimson-deep)', fontWeight: 800, fontSize: 12,
                                fontFamily: 'var(--font-display)',
                            }}>
                                {o.off_discount_percentage}%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Health Flags ─────────────────────────────────────────────────────────────
function HealthFlags({ stats }: { stats: DashboardStats }) {
    const flags = [
        stats.unpriced_products > 0 && {
            label: `${stats.unpriced_products} product${stats.unpriced_products > 1 ? 's' : ''} without a price`,
            severity: 'warn' as const,
        },
        stats.unphoto_products > 0 && {
            label: `${stats.unphoto_products} product${stats.unphoto_products > 1 ? 's' : ''} missing photos`,
            severity: 'info' as const,
        },
        stats.inactive_products > 0 && {
            label: `${stats.inactive_products} inactive product${stats.inactive_products > 1 ? 's' : ''}`,
            severity: 'info' as const,
        },
    ].filter(Boolean) as { label: string; severity: 'warn' | 'info' }[]

    if (flags.length === 0) return null

    return (
        <div style={{
            borderRadius: 18, padding: '1.2rem 1.5rem', marginBottom: 14,
            border: '1px solid rgba(250,204,21,0.2)',
            background: 'rgba(250,204,21,0.04)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertCircle size={15} color="#facc15" />
                <span style={{
                    fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#facc15', fontFamily: 'var(--font-display)',
                }}>
                    Action Needed
                </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {flags.map((f, i) => (
                    <div key={i} style={{
                        padding: '5px 14px', borderRadius: 9999, fontSize: 12,
                        border: `1px solid ${f.severity === 'warn' ? 'rgba(250,204,21,0.3)' : 'rgba(200,168,75,0.2)'}`,
                        color: f.severity === 'warn' ? '#facc15' : 'var(--ivory-dim)',
                        background: f.severity === 'warn' ? 'rgba(250,204,21,0.08)' : 'rgba(200,168,75,0.05)',
                    }}>
                        {f.label}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
    userName: string
    userRole: AppRole
    avatarUrl: string | null
}

// ─── Main Dashboard Client ────────────────────────────────────────────────────
export default function DashboardClient({ userName, userRole, avatarUrl }: Props) {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null);

    const supabase = getBrowserSupabase()

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data, error } = await supabase.rpc('get_dashboard_stats')
            if (error) { setError(error.message); setLoading(false); return }
            setStats(data as DashboardStats)
            setLoading(false)
        }
        load()
    }, [])

    const s = stats

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                }
                .dash-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px;
                }
                .dash-grid-3 {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 14px;
                }
                @media (max-width: 900px) {
                    .dash-grid   { grid-template-columns: repeat(2, 1fr); }
                    .dash-grid-3 { grid-template-columns: 1fr; }
                }
                @media (max-width: 560px) {
                    .dash-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
                }
            `}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 72px', boxSizing: 'border-box' }}>

                {/* ── Page header ───────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', flexWrap: 'wrap', gap: 12,
                    marginBottom: 28, animation: 'fadeUp .4s ease both',
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(20px, 4vw, 28px)',
                            margin: 0, color: 'var(--ivory)', letterSpacing: '0.04em',
                        }}>
                            Dashboard
                        </h1>
                        <p style={{ color: 'var(--ivory-dim)', marginTop: 5, fontSize: 13 }}>
                            {new Date().toLocaleDateString('en-BD', { dateStyle: 'long' })}
                        </p>
                    </div>

                    {/* User pill — data comes from server, no extra fetch */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px 8px 8px', borderRadius: 9999,
                        border: '1px solid var(--border)',
                        background: 'rgba(107,15,15,0.3)',
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
                            background: 'rgba(200,168,75,0.15)',
                            border: '1px solid rgba(200,168,75,0.25)',
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                            {avatarUrl
                                ? <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: 13, color: 'var(--gold)' }}>{userName.charAt(0).toUpperCase()}</span>
                            }
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ivory)', lineHeight: 1.2 }}>{userName}</div>
                            <div style={{ fontSize: 10, color: 'var(--gold-muted)', letterSpacing: '0.08em' }}>
                                {ROLE_LABEL[userRole]}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Error banner ──────────────────────────────────────────── */}
                {error && (
                    <div style={{
                        padding: '14px 18px', borderRadius: 12, marginBottom: 20,
                        border: '1px solid rgba(248,113,113,0.3)',
                        background: 'rgba(248,113,113,0.08)',
                        color: '#f87171', fontSize: 13,
                    }}>
                        ⚠️ Failed to load stats: {error}
                    </div>
                )}

                {/* ── Action flags ──────────────────────────────────────────── */}
                {!loading && s && <HealthFlags stats={s} />}

                {/* ── KPI row 1 ─────────────────────────────────────────────── */}
                <div className="dash-grid" style={{ marginBottom: 14 }}>
                    {[
                        {
                            label: 'Total Products', icon: Package, accent: true,
                            value: loading ? '…' : fmt(s?.total_products),
                            sub: loading ? undefined : `${s?.active_products ?? 0} active · ${s?.inactive_products ?? 0} inactive`,
                            trend: loading ? undefined : { value: 1, label: `+${s?.new_products_7d ?? 0} this week` },
                        },
                        {
                            label: 'Categories', icon: Tag,
                            value: loading ? '…' : fmt(s?.total_categories),
                            sub: loading ? undefined : `${s?.active_categories ?? 0} active`,
                        },
                        {
                            label: 'Active Offers', icon: Percent,
                            value: loading ? '…' : fmt(s?.active_offers),
                            sub: loading ? undefined : `${s?.total_offers ?? 0} total`,
                        },
                        {
                            label: 'Team Members', icon: Users,
                            value: loading ? '…' : fmt(s?.total_users),
                            sub: loading ? undefined : `${s?.active_users ?? 0} active`,
                        },
                    ].map((card, i) => (
                        <div key={card.label} style={{ animation: `fadeUp .35s ease both`, animationDelay: `${i * 0.07}s` }}>
                            <StatCard {...card} />
                        </div>
                    ))}
                </div>

                {/* ── KPI row 2 ─────────────────────────────────────────────── */}
                <div className="dash-grid" style={{ marginBottom: 14 }}>
                    {[
                        {
                            label: 'Avg. Price', icon: TrendingUp,
                            value: loading ? '…' : fmtPrice(s?.avg_product_price),
                            sub: loading ? undefined : `Range: ${fmtPrice(s?.min_price)} – ${fmtPrice(s?.max_price)}`,
                        },
                        {
                            label: 'New (7 days)', icon: Star,
                            value: loading ? '…' : fmt(s?.new_products_7d),
                            sub: 'Products added this week',
                        },
                        {
                            label: 'New (30 days)', icon: Star,
                            value: loading ? '…' : fmt(s?.new_products_30d),
                            sub: 'Products added this month',
                        },
                        {
                            label: 'Missing Data', icon: AlertCircle,
                            value: loading ? '…' : fmt((s?.unpriced_products ?? 0) + (s?.unphoto_products ?? 0)),
                            sub: loading ? undefined : `${s?.unpriced_products ?? 0} unpriced · ${s?.unphoto_products ?? 0} no photo`,
                        },
                    ].map((card, i) => (
                        <div key={card.label} style={{ animation: `fadeUp .35s ease both`, animationDelay: `${(i + 4) * 0.07}s` }}>
                            <StatCard {...card} />
                        </div>
                    ))}
                </div>

                {/* ── Charts row ────────────────────────────────────────────── */}
                <div className="dash-grid-3">
                    <RecentProducts data={s?.recent_products ?? []} loading={loading} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <CategoryBars data={s?.top_categories ?? []} loading={loading} />
                        <StatusDonut
                            data={s?.status_breakdown ?? []}
                            total={s?.total_products ?? 0}
                            loading={loading}
                        />
                    </div>
                    <ActiveOffers data={s?.active_offer_list ?? []} loading={loading} />
                </div>

            </div>
        </>
    )
}