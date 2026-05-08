"use client"
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import type { Perfume, PriceSize } from '../../types/perfume'
import HalalBadge from '../ui/HalalBadge'
import AnimatedPrice from '../ui/AnimatedPrice'
import { openFacebook, openWhatsApp } from '../../lib/whatsapp'
import { cn, formatPercent, getTimeSince } from '@/lib/utils'

interface PerfumeCardProps {
  perfume: Perfume
}

export default function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [selectedSize, setSelectedSize] = useState<PriceSize>(perfume.pricing[0].size)
  const [showNotes, setShowNotes] = useState(false)

  const currentPrice = useMemo(
    () =>
      perfume.pricing.find((p) => p.size === selectedSize)?.price ??
      perfume.pricing[0].price,
    [perfume, selectedSize]
  )

  const trendColor =
    perfume.trend === 'up'
      ? 'var(--price-up)'
      : perfume.trend === 'down'
        ? 'var(--price-down)'
        : 'var(--price-stable)'

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="card-glass card-glow-hover"
      style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src={perfume.imageUrl}
          alt={perfume.name}
          fill
          style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="perfume-img"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        />

        {/* Overlay gradient */}
        <div
          className="img-overlay"
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden="true"
        />

        {/* Featured badge */}
        {perfume.isFeatured && (
          <div style={{ position: 'absolute', left: 12, top: 12 }}>
            <span className="badge-featured">Featured</span>
          </div>
        )}

        {/* Halal badge */}
        <div style={{ position: 'absolute', right: 12, top: 12 }}>
          <HalalBadge size="sm" />
        </div>

        {/* Concentration pill */}
        <div
          style={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            fontFamily: 'var(--font-display)',
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            color: 'var(--gold)',
            border: '1px solid rgba(200,168,75,0.4)',
            borderRadius: 9999,
            padding: '3px 10px',
            backdropFilter: 'blur(8px)',
            background: 'rgba(13,4,4,0.5)',
          }}
        >
          {perfume.concentration}
        </div>

        {/* Category chip */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            fontFamily: 'var(--font-display)',
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            color: 'var(--ivory-dim)',
            border: '1px solid var(--border)',
            borderRadius: 9999,
            padding: '3px 10px',
            backdropFilter: 'blur(8px)',
            background: 'rgba(13,4,4,0.5)',
          }}
        >
          {perfume.category}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '1.1rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          flex: 1,
        }}
      >
        {/* Name row */}
        <div style={{ marginBottom: 2 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--gold-light)',
              fontSize: '1.05rem',
              margin: 0,
              letterSpacing: '0.02em',
              lineHeight: 1.25,
            }}
            className="truncate"
          >
            {perfume.name}
          </h3>
          {perfume.nameAr && (
            <p
              dir="rtl"
              style={{
                color: 'var(--gold-muted)',
                fontStyle: 'italic',
                fontSize: '0.85rem',
                margin: '2px 0 0',
              }}
            >
              {perfume.nameAr}
            </p>
          )}
        </div>

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.58rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold-muted)',
            margin: '4px 0 10px',
          }}
        >
          {perfume.brand}
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
            marginBottom: 10,
          }}
        />

        {/* Notes toggle */}
        <button
          onClick={() => setShowNotes((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
            color: 'var(--gold-muted)',
          }}
          aria-expanded={showNotes}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.6rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Fragrance Notes
          </span>
          <motion.span
            animate={{ rotate: showNotes ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '0.6rem', display: 'inline-block' }}
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showNotes ? (
            <motion.div
              key="notes-open"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden', marginBottom: 10 }}
            >
              {(
                [
                  ['T', perfume.notes.top],
                  ['H', perfume.notes.heart],
                  ['B', perfume.notes.base],
                ] as [string, string[]][]
              ).map(([label, notes]) => (
                <div key={label} className="notes-row" style={{ marginBottom: 4 }}>
                  <span className="notes-label">{label}</span>
                  <span>{notes.join(' · ')}</span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="notes-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: '0.75rem',
                color: 'var(--ivory-dim)',
                margin: '0 0 10px',
                lineHeight: 1.5,
              }}
            >
              {perfume.notes.top.slice(0, 3).join(' · ')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Size pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          {perfume.pricing.map((p) => (
            <button
              key={p.size}
              onClick={() => setSelectedSize(p.size)}
              className={cn('size-pill', selectedSize === p.size && 'active')}
            >
              {p.size}
            </button>
          ))}
        </div>

        {/* Price row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <AnimatedPrice price={currentPrice} trend={perfume.trend} size="lg" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: trendColor,
              padding: '2px 8px',
              borderRadius: 9999,
              background: `${trendColor}15`,
            }}
          >
            {formatPercent(perfume.priceChangePercent)} today
          </span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <button
            className="btn-whatsapp"
            onClick={() => openWhatsApp(perfume, selectedSize)}
            aria-label={`Order ${perfume.name} via WhatsApp`}
            style={{ flex: 1 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            Order via WhatsApp
          </button>

          <button
            className="btn-facebook"
            onClick={() => openFacebook()}
            aria-label="Message on Facebook"
            style={{ flex: 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Message on Facebook
          </button>
        </div>

        {/* Timestamp */}
        <p
          style={{
            marginTop: 10,
            fontSize: '0.65rem',
            color: 'var(--gold-dim)',
            fontFamily: 'var(--font-mono)',
            textAlign: 'right',
          }}
        >
          {getTimeSince(perfume.lastUpdated)}
        </p>
      </div>
    </motion.article>
  )
}