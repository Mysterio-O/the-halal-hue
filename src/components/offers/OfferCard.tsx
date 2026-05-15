import React from 'react';
import { OfferWithCount } from '@/lib/queries/offers';

interface Props {
    offer: OfferWithCount;
}

export default function OfferCard({ offer }: Props) {
    const expiryLabel = offer.expiryLabel ?? null;
    const isExpiringSoon = offer.isExpiringSoon ?? false;

    console.log(offer)

    return (
        <div
            className="group flex-shrink-0 relative overflow-hidden"
            style={{
                width: 'clamp(260px, 72vw, 320px)',
                borderRadius: 'var(--card-radius)',
                border: '1px solid var(--border)',
                background: 'linear-gradient(135deg, rgba(107,15,15,0.7) 0%, rgba(61,10,10,0.85) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(200,168,75,0.14), transparent 70%)',
                    transition: 'opacity 0.35s ease',
                    borderRadius: 'inherit',
                }}
            />

            {/* Top accent bar */}
            <div
                style={{
                    height: 3,
                    background: 'linear-gradient(90deg, var(--gold-muted), var(--gold-light), var(--gold-muted))',
                    borderRadius: '20px 20px 0 0',
                }}
            />

            <div style={{ padding: '1.4rem 1.5rem 1.5rem' }}>

                {/* Discount badge + expiry pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    {offer.off_discount_percentage && (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                                color: 'var(--crimson-deep)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                                padding: '6px 14px',
                                borderRadius: 12,
                                lineHeight: 1,
                            }}
                        >
                            -{offer.off_discount_percentage}%
                        </div>
                    )}

                    {offer.off_ends && expiryLabel && (
                        <span
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.62rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: isExpiringSoon ? 'var(--price-down)' : 'var(--gold-muted)',
                                border: `1px solid ${isExpiringSoon ? 'rgba(248,113,113,0.35)' : 'var(--border)'}`,
                                borderRadius: 9999,
                                padding: '4px 10px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {isExpiringSoon && '⚡ '}{expiryLabel}
                        </span>
                    )}
                </div>

                {/* Offer name */}
                <h3
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        letterSpacing: '0.04em',
                        color: 'var(--ivory)',
                        lineHeight: 1.3,
                        marginBottom: '0.5rem',
                    }}
                >
                    {offer.off_name}
                </h3>

                {/* Description */}
                {offer.description && (
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.82rem',
                            color: 'var(--ivory-dim)',
                            lineHeight: 1.6,
                            marginBottom: '1rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {offer.description}
                    </p>
                )}

                {/* Divider */}
                <div
                    style={{
                        height: 1,
                        background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
                        margin: '0.75rem 0',
                    }}
                />

                {/* Footer: product count only — no CTA */}
                <div className="flex items-center justify-between">
                    <span
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-muted)',
                        }}
                    >
                        {offer.productCount > 0
                            ? `${offer.productCount} fragrance${offer.productCount === 1 ? '' : 's'}`
                            : 'Coming soon'}
                    </span>

                    {/* Halal badge instead of CTA */}
                    <span className="badge-halal badge-halal-sm">✦ Halal</span>
                </div>
            </div>
        </div>
    );
}