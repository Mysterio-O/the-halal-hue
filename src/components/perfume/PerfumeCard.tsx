'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductWithDerived, PriceList, applyDiscount } from '@/types/product';

interface PerfumeCardProps {
  product: ProductWithDerived;
}

export default function PerfumeCard({ product }: PerfumeCardProps) {
  const [selectedPrice, setSelectedPrice] = useState<PriceList | null>(
    product.lowestPrice ?? product.sortedPrices[0] ?? null
  );

  const finalPrice = selectedPrice
    ? applyDiscount(selectedPrice.price, product.discountPct)
    : null;

  const hasDiscount =
    product.isOnOffer &&
    selectedPrice !== null &&
    finalPrice !== null &&
    finalPrice < selectedPrice.price;

  return (
    <div className="card-glass card-glow-hover flex flex-col overflow-hidden group min-w-0 w-full h-full">

      {/* ── Image — compact square-ish ratio ── */}
      <Link
        href={`/perfumes/${product.id}`}
        className="relative block w-full overflow-hidden bg-[var(--crimson-deep)]"
        style={{ aspectRatio: '1 / 1.15', position: 'relative' }}
        tabIndex={-1}
        aria-hidden
      >
        {product.primaryPhoto ? (
          <Image
            src={product.primaryPhoto.photo_url}
            alt={product.pr_name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="select-none opacity-20"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                color: 'var(--gold)',
              }}
            >
              ✦
            </span>
          </div>
        )}

        <div className="img-overlay absolute inset-0" />

        {/* Offer badge — top-left */}
        {product.isOnOffer && product.offers?.off_discount_percentage && (
          <span
            className="badge-featured absolute top-1.5 left-1.5 z-10"
            style={{ fontSize: '0.55rem', padding: '2px 7px' }}
          >
            -{product.offers.off_discount_percentage}%
          </span>
        )}

        {/* Halal badge — top-right */}
        <span
          className="badge-halal absolute top-1.5 right-1.5 z-10"
          style={{ fontSize: '0.55rem', padding: '2px 7px' }}
        >
          ✦ Halal
        </span>
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col gap-1 p-2 flex-1 w-full min-w-0" style={{paddingLeft:'10px', paddingRight:'10px', paddingBottom:'12px'}}>

        {/* Category */}
        {product.categories && (
          <span
            className="truncate w-full block"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              color: 'var(--gold-muted)',
              textTransform: 'uppercase',
            }}
          >
            {product.categories.cat_name}
          </span>
        )}

        {/* Name */}
        <Link href={`/perfumes/${product.id}`} className="block w-full min-w-0">
          <h3
            className="line-clamp-2 leading-snug hover:text-[var(--gold-light)] transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              color: 'var(--ivory)',
              letterSpacing: '0.01em',
            }}
          >
            {product.pr_name}
          </h3>
        </Link>

        {/* Size pills — tiny */}
        {product.sortedPrices.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5 w-full">
            {product.sortedPrices.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setSelectedPrice(pl)}
                className={`size-pill ${selectedPrice?.id === pl.id ? 'active' : ''}`}
                style={{ fontSize: '0.58rem', padding: '2px 7px' }}
              >
                {pl.quantity}ml
              </button>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-1 w-full min-w-0">
          <div className="flex items-baseline gap-1 min-w-0 truncate">
            {finalPrice !== null && (
              <span
                className="text-gold-gradient"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                ৳{finalPrice.toFixed(0)}
              </span>
            )}
            {hasDiscount && selectedPrice && (
              <span
                className="truncate"
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--gold-muted)',
                  textDecoration: 'line-through',
                  opacity: 0.65,
                }}
              >
                ৳{selectedPrice.price.toFixed(0)}
              </span>
            )}
          </div>

          <Link
            href={`/perfumes/${product.id}`}
            className="btn-gold shrink-0"
            style={{ padding: '4px 10px', fontSize: '0.58rem', borderRadius: '7px', gap: '4px' }}
          >
            <span>View</span>
          </Link>
        </div>
      </div>
    </div>
  );
}