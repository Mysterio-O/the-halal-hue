import React from 'react';
import { getActiveOffers } from '@/lib/queries/offers';
import OfferCard from '@/components/offers/OfferCard';

export default async function OffersSection() {
    const offers = await getActiveOffers();

    // Hide section entirely if nothing to show
    if (!offers.length) return null;

    return (
        <section
            id="offers"
            style={{
                background: 'linear-gradient(180deg, var(--obsidian) 0%, var(--obsidian-2) 100%)',
                padding: 'clamp(3rem, 8vw, 5rem) 0',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Arabic watermark background ornament */}
            <span className="arabic-watermark" aria-hidden>
                ✦
            </span>

            <div className="max-w-5xl mx-auto">

                {/* ── Heading ── */}
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            style={{
                                height: 1,
                                flex: 1,
                                background: 'linear-gradient(90deg, transparent, var(--border-strong))',
                            }}
                        />
                        <span
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.65rem',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: 'var(--gold-muted)',
                            }}
                        >
                            Limited Time
                        </span>
                        <div
                            style={{
                                height: 1,
                                flex: 1,
                                background: 'linear-gradient(90deg, var(--border-strong), transparent)',
                            }}
                        />
                    </div>

                    <h2
                        className="text-gold-gradient"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                            letterSpacing: '0.06em',
                            lineHeight: 1.2,
                        }}
                    >
                        Exclusive Offers
                    </h2>

                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem',
                            color: 'var(--ivory-dim)',
                            marginTop: '0.4rem',
                        }}
                    >
                        Save more on our finest halal fragrances — for a limited time.
                    </p>
                </div>

                {/* ── Horizontal scroll track ── */}
                <div
                    className="scrollbar-hide"
                    style={{
                        overflowX: 'auto',
                        overflowY: 'visible',
                        WebkitOverflowScrolling: 'touch',
                        cursor: 'grab',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '0.5rem 1.5rem 1.5rem',
                            // Enough right padding so last card doesn't clip
                            paddingRight: 'max(1.5rem, calc(50vw - 600px))',
                        }}
                    >
                        {offers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} />
                        ))}
                    </div>
                </div>

                {/* ── Fade edges hint ── */}
                <div className="relative px-6 mt-4 flex items-center justify-between">
                    <p
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.62rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-muted)',
                            opacity: 0.6,
                        }}
                    >
                        {offers.length} active offer{offers.length !== 1 ? 's' : ''}
                    </p>

                    <span
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.62rem',
                            letterSpacing: '0.1em',
                            color: 'var(--gold-muted)',
                            opacity: 0.5,
                            textTransform: 'uppercase',
                        }}
                    >
                        Scroll to explore →
                    </span>
                </div>
            </div>
        </section>
    );
}