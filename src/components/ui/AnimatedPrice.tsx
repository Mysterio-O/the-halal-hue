"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { PriceTrend } from '../../types/perfume'
import { formatBDT } from '@/lib/utils'

type FlashDirection = 'up' | 'down' | null

interface AnimatedPriceProps {
  price: number
  trend: PriceTrend
  size?: 'sm' | 'lg'
}

const TREND_ARROW: Record<PriceTrend, string> = {
  up: '▲',
  down: '▼',
  stable: '—',
}

const TREND_COLOR: Record<PriceTrend, string> = {
  up: 'var(--price-up)',
  down: 'var(--price-down)',
  stable: 'var(--price-stable)',
}

const FLASH_BG: Record<NonNullable<FlashDirection>, string> = {
  up: 'rgba(74,222,128,0.1)',
  down: 'rgba(248,113,113,0.1)',
}

export default function AnimatedPrice({ price, trend, size = 'lg' }: AnimatedPriceProps) {
  const reduced = useReducedMotion()
  const prevPrice = useRef<number>(price)
  const [flash, setFlash] = useState<FlashDirection>(null)

  useEffect(() => {
    if (price === prevPrice.current) return
    if (!reduced) {
      const dir: FlashDirection = price > prevPrice.current ? 'up' : 'down'
      setFlash(dir)
      const t = window.setTimeout(() => setFlash(null), 900)
      prevPrice.current = price
      return () => window.clearTimeout(t)
    }
    prevPrice.current = price
  }, [price, reduced])

  const fontSize = size === 'lg' ? '1.3rem' : '0.92rem'

  return (
    <motion.div
      animate={{
        backgroundColor:
          flash ? FLASH_BG[flash] : 'transparent',
      }}
      transition={{ duration: 0.7 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: 8,
        padding: '2px 6px',
        marginLeft: -6,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--gold-light)',
          fontSize,
          letterSpacing: '0.01em',
        }}
      >
        {formatBDT(price)}
      </span>
      <span
        aria-label={`Price trending ${trend}`}
        style={{
          color: TREND_COLOR[trend],
          fontFamily: 'var(--font-mono)',
          fontSize: size === 'lg' ? '0.75rem' : '0.65rem',
          lineHeight: 1,
        }}
      >
        {TREND_ARROW[trend]}
      </span>
    </motion.div>
  )
}