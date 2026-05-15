'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductWithDerived, ProductPhoto, PriceList, applyDiscount } from '@/types/product';

interface Props {
    product: ProductWithDerived;
}

export default function ProductDetailClient({ product }: Props) {
    const [activePhoto, setActivePhoto] = useState<ProductPhoto | null>(
        product.primaryPhoto
    );
    const [selectedPrice, setSelectedPrice] = useState<PriceList | null>(
        product.lowestPrice
    );

    const finalPrice = selectedPrice
        ? applyDiscount(selectedPrice.price, product.discountPct)
        : null;

    const hasDiscount =
        product.isOnOffer &&
        selectedPrice &&
        finalPrice !== null &&
        finalPrice < selectedPrice.price;

    const offerEnds = product.offers?.off_ends
        ? new Date(product.offers.off_ends)
        : null;

    const offerExpired = offerEnds ? offerEnds < new Date() : false;
    const showOffer = product.isOnOffer && !offerExpired;

    return (
        <div className="detail-shell">
            <div className="detail-bg" aria-hidden="true" />
            <div className="detail-wrapper">
                <style>{`
                    .detail-shell {
                        position: relative;
                        min-height: 100vh;
                        background: var(--obsidian);
                    }
                    .detail-bg {
                        position: absolute;
                        inset: 0;
                        background:
                            radial-gradient(800px 520px at 10% 5%, rgba(200,168,75,0.12), transparent 60%),
                            radial-gradient(640px 520px at 95% 10%, rgba(107,15,15,0.35), transparent 70%),
                            linear-gradient(180deg, rgba(13,4,4,0.45), rgba(13,4,4,0.92));
                        pointer-events: none;
                    }
                    .detail-wrapper {
                        position: relative;
                        z-index: 1;
                        // padding: calc(var(--nav-height)) 0 0px;
                    }
                    .detail-grid {
                        display: grid;
                        gap: 32px;
                        grid-template-columns: 1.08fr 1fr;
                    }
                    .detail-card {
                        // border-radius: 16px;
                        // border: 1px solid var(--border);
                        background: linear-gradient(135deg, rgba(107,15,15,0.38), rgba(61,10,10,0.7));
                        padding: 16px;
                    }
                    .image-frame {
                        padding: 1px;
                        border-radius: 22px;
                        background: linear-gradient(135deg, rgba(200,168,75,0.6), rgba(200,168,75,0.15), transparent 60%);
                    }
                    .image-inner {
                        position: relative;
                        border-radius: 21px;
                        overflow: hidden;
                        background: rgba(255,255,255,0.03);
                        aspect-ratio: 3 / 4;
                    }
                    .thumb-strip {
                        display: flex;
                        gap: 10px;
                        overflow-x: auto;
                        padding-bottom: 4px;
                    }
                    .detail-kicker {
                        font-family: var(--font-display);
                        font-size: 0.66rem;
                        letter-spacing: 0.2em;
                        text-transform: uppercase;
                        color: var(--gold-muted);
                    }
                    .detail-title {
                        font-family: var(--font-display);
                        font-size: clamp(1.85rem, 4vw, 2.7rem);
                        color: var(--ivory);
                        letter-spacing: 0.02em;
                        margin: 6px 0 4px;
                    }
                    .detail-subline {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        font-size: 0.75rem;
                        color: var(--ivory-dim);
                    }
                    .detail-chip {
                        padding: 4px 10px;
                        border-radius: 9999px;
                        border: 1px solid var(--border-strong);
                        background: rgba(200,168,75,0.08);
                        color: var(--gold-light);
                        font-family: var(--font-display);
                        font-size: 0.6rem;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                    }
                    .detail-divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, rgba(200,168,75,0.5), transparent);
                        margin: 12px 0;
                    }
                    @media (max-width: 900px) {
                        .detail-grid { grid-template-columns: 1fr; }
                    }
                `}</style>

                {/* ── Back nav ── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6" style={{ marginBottom: 18 }}>
                    <Link
                        href="/#perfumes"
                        className="inline-flex items-center gap-2 transition-colors duration-200"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-muted)',
                        }}
                    >
                        <span>←</span>
                        <span>Back to Collection</span>
                    </Link>
                </div>

                {/* ── Main content ── */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="detail-grid">
                        {/* ── Left: Image gallery ── */}
                        <div className="flex flex-col gap-3">
                            <div className="image-frame">
                                <div className="image-inner">
                                    {activePhoto ? (
                                        <Image
                                            src={activePhoto.photo_url}
                                            alt={product.pr_name}
                                            fill
                                            priority
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span
                                                className="text-gold-gradient select-none"
                                                style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', opacity: 0.25 }}
                                            >
                                                ✦
                                            </span>
                                        </div>
                                    )}

                                    {showOffer && product.offers?.off_discount_percentage && (
                                        <div
                                            className="absolute top-4 left-0 z-10 flex items-center gap-1.5"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                                                color: 'var(--crimson-deep)',
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '0.65rem',
                                                letterSpacing: '0.1em',
                                                fontWeight: 700,
                                                padding: '5px 14px 5px 10px',
                                                borderRadius: '0 9999px 9999px 0',
                                            }}
                                        >
                                            {product.offers.off_name} · -{product.offers.off_discount_percentage}%
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 z-10 badge-halal badge-halal-sm">✦ Halal</div>
                                </div>
                            </div>

                            {product.product_photos.length > 1 && (
                                <div className="thumb-strip scrollbar-hide">
                                    {product.product_photos.map((photo) => (
                                        <button
                                            key={photo.id}
                                            onClick={() => setActivePhoto(photo)}
                                            className="relative flex-shrink-0 overflow-hidden transition-all duration-200"
                                            style={{
                                                width: 70,
                                                height: 88,
                                                borderRadius: 12,
                                                border: `2px solid ${activePhoto?.id === photo.id ? 'var(--gold)' : 'var(--border)'}`,
                                                opacity: activePhoto?.id === photo.id ? 1 : 0.6,
                                            }}
                                        >
                                            <Image
                                                src={photo.photo_url}
                                                alt=""
                                                fill
                                                sizes="70px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Right: Details ── */}
                        <div className="flex flex-col gap-5">
                            <div className="detail-card">
                                <div className="detail-kicker">{product.categories?.cat_name ?? 'Signature'}</div>
                                <h1 className="detail-title">{product.pr_name}</h1>
                                <div className="detail-subline">
                                    <span>SKU: {product.pr_sku}</span>
                                    <span className="detail-chip">Halal Certified</span>
                                    {showOffer && product.offers?.off_discount_percentage && (
                                        <span className="detail-chip">{product.offers.off_discount_percentage}% Off</span>
                                    )}
                                </div>
                                <div className="detail-divider" />
                                <p
                                    style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '0.95rem',
                                        color: 'var(--ivory-dim)',
                                        lineHeight: 1.7,
                                        margin: 0,
                                    }}
                                >
                                    {product.pr_description?.trim() || 'A refined halal fragrance crafted for everyday elegance and lasting presence.'}
                                </p>
                            </div>

                            {product.sortedPrices.length > 0 && (
                                <div className="detail-card">
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '0.68rem',
                                            letterSpacing: '0.14em',
                                            color: 'var(--gold-muted)',
                                            textTransform: 'uppercase',
                                            marginBottom: 10,
                                        }}
                                    >
                                        Select Size
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sortedPrices.map((pl) => (
                                            <button
                                                key={pl.id}
                                                onClick={() => setSelectedPrice(pl)}
                                                className={`size-pill ${selectedPrice?.id === pl.id ? 'active' : ''}`}
                                            >
                                                {pl.quantity}ml
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPrice && (
                                <div className="detail-card" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '0.65rem',
                                                letterSpacing: '0.12em',
                                                color: 'var(--gold-muted)',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Price · {selectedPrice.quantity}ml
                                        </div>
                                        <div className="flex items-baseline gap-2" style={{ marginTop: 6 }}>
                                            <span
                                                className="text-gold-gradient"
                                                style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700 }}
                                            >
                                                ৳{finalPrice?.toFixed(0)}
                                            </span>
                                            {hasDiscount && (
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--font-body)',
                                                        fontSize: '1rem',
                                                        color: 'var(--gold-muted)',
                                                        textDecoration: 'line-through',
                                                        opacity: 0.6,
                                                    }}
                                                >
                                                    ৳{selectedPrice.price.toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                        {showOffer && offerEnds && (
                                            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--price-down)', opacity: 0.85 }}>
                                                Offer ends {offerEnds.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                    {hasDiscount && product.offers?.off_discount_percentage && (
                                        <div className="badge-featured" style={{ padding: '6px 14px', whiteSpace: 'nowrap' }}>
                                            Save {product.offers.off_discount_percentage}%
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="detail-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                <a
                                    href={`https://wa.me/?text=I'm interested in ${encodeURIComponent(product.pr_name)} (${selectedPrice?.quantity ?? ''}ml)`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-whatsapp"
                                    style={{ flex: '1 1 180px' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Order via WhatsApp
                                </a>

                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-facebook"
                                    style={{ flex: '1 1 180px' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Find us on Facebook
                                </a>
                            </div>

                            <div className="detail-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                {[
                                    { icon: '🕌', label: 'Halal Certified' },
                                    { icon: '✦', label: 'Premium Quality' },
                                    { icon: '📦', label: 'Fast Delivery' },
                                ].map(({ icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '0.65rem',
                                                letterSpacing: '0.12em',
                                                color: 'var(--gold-muted)',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}