import React from 'react'
import type { Perfume, PriceTrend } from '../../types/perfume'

interface TickerItem {
  id: string
  text: string
  trend: PriceTrend
  price: number
}

const TREND_COLOR: Record<PriceTrend, string> = {
  up: 'var(--price-up)',
  down: 'var(--price-down)',
  stable: 'var(--price-stable)',
}

const TREND_ARROW: Record<PriceTrend, string> = {
  up: '▲',
  down: '▼',
  stable: '—',
}

interface PriceTickerProps {
  perfumes: Perfume[]
}

export default function PriceTicker({ perfumes }: PriceTickerProps) {
  const items: TickerItem[] = perfumes.map((p) => {
    const lowest = p.pricing.reduce(
      (acc, b) => Math.min(acc, b.price),
      Number.MAX_SAFE_INTEGER
    )
    return {
      id: p.id,
      text: p.name,
      trend: p.trend,
      price: lowest,
    }
  })

  // Duplicate for seamless loop
  const looped = [...items, ...items]

  return (
    <div
      style={{
        width: '100%',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'rgba(13,4,4,0.65)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}
    >
      {/* Left fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: 'linear-gradient(90deg, rgba(13,4,4,1), transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Right fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: 'linear-gradient(270deg, rgba(13,4,4,1), transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        className="ticker-track"
        style={{ paddingLeft: '2rem', whiteSpace: 'nowrap' }}
        aria-hidden="true"
      >
        {looped.map((item, idx) => (
          <span
            key={`${item.id}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginRight: '3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ color: 'var(--gold-muted)', fontSize: '0.55rem' }}>✦</span>
            <span style={{ color: 'var(--gold-light)' }}>{item.text}</span>
            <span style={{ color: 'var(--gold-muted)', margin: '0 2px' }}>—</span>
            <span style={{ color: 'var(--gold-light)' }}>৳{item.price.toLocaleString('en-BD')}</span>
            <span style={{ color: TREND_COLOR[item.trend], fontSize: '0.65rem' }}>
              {TREND_ARROW[item.trend]}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}