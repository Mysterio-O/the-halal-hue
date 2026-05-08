"use client"
import React from 'react'
import { motion } from 'motion/react'
import type { PerfumeCategory } from '../../types/perfume'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: PerfumeCategory[]
  active: PerfumeCategory | 'All'
  onChange: (c: PerfumeCategory | 'All') => void
}

const CATEGORY_ICONS: Record<PerfumeCategory | 'All', string> = {
  All: '✦',
  Oud: '🪵',
  Floral: '🌹',
  Woody: '🌲',
  Oriental: '🌙',
  Fresh: '💨',
  Citrus: '🍊',
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  const pills = ['All', ...Array.from(new Set(categories))] as (PerfumeCategory | 'All')[]

  return (
    <div
      className="scrollbar-hide"
      style={{ overflowX: 'auto', paddingBottom: 4 }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '4px 2px',
          width: 'max-content',
          minWidth: '100%',
        }}
      >
        {pills.map((p) => {
          const isActive = p === active
          return (
            <button
              key={p}
              aria-pressed={isActive}
              onClick={() => onChange(p)}
              className={cn('cat-pill', isActive && 'active')}
            >
              {CATEGORY_ICONS[p]} {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}