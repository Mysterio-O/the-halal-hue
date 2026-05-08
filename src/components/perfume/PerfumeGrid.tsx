"use client"
import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import CategoryFilter from './CategoryFilter'
import PerfumeCard from './PerfumeCard'
import type { Perfume, PerfumeCategory } from '../../types/perfume'

interface PerfumeGridProps {
  perfumes: Perfume[]
  isLoading: boolean
  lastUpdated: Date | null
}

function SkeletonCard() {
  return (
    <div
      className="shimmer"
      style={{
        borderRadius: 20,
        height: 420,
        border: '1px solid var(--border)',
      }}
    />
  )
}

export default function PerfumeGrid({ perfumes, isLoading }: PerfumeGridProps) {
  const [activeCategory, setActiveCategory] = useState<PerfumeCategory | 'All'>('All')

  const categories = useMemo(
    () => Array.from(new Set(perfumes.map((p) => p.category))) as PerfumeCategory[],
    [perfumes]
  )

  const filtered =
    activeCategory === 'All'
      ? perfumes
      : perfumes.filter((p) => p.category === activeCategory)

  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!filtered.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 0',
          color: 'var(--gold-muted)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-body)',
          fontSize: '1.1rem',
        }}
      >
        No perfumes found in this category.
      </div>
    )
  }

  return (
    <div>
      <CategoryFilter
        categories={categories}
        active={activeCategory}
        onChange={(c) => setActiveCategory(c as PerfumeCategory | 'All')}
      />

      <motion.div
        layout
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.5rem',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((p, idx) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { delay: idx * 0.045, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                transition: { duration: 0.18 },
              }}
              style={{ height: '100%' }}
            >
              <PerfumeCard perfume={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}