"use client"
import React, { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import SectionHeading from '../ui/SectionHeading'
import HalalBadge from '../ui/HalalBadge'

interface StatCardProps {
  value: string
  label: string
  delay: number
}

function StatCard({ value, label, delay }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          color: 'var(--gold-light)',
          lineHeight: 1.1,
        }}
        className="text-gold-shimmer"
      >
        {value}
      </div>
      <div
        style={{
          color: 'var(--gold-muted)',
          fontStyle: 'italic',
          fontSize: '0.85rem',
          marginTop: '0.5rem',
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

const STATS: StatCardProps[] = [
  { value: '100%', label: 'Halal Certified', delay: 0 },
  { value: '30s', label: 'Price Refresh', delay: 0.08 },
  { value: '50+', label: 'Fragrances', delay: 0.16 },
  { value: '5★', label: 'Customer Rating', delay: 0.24 },
]

export default function AboutSection() {
  const textRef = useRef<HTMLDivElement>(null)
  const inView = useInView(textRef, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      className="section-obsidian"
      style={{ padding: 'var(--section-padding) 0' }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 1.25rem',
          display: 'grid',
          gap: '3rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'start',
        }}
      >
        {/* Text column */}
        <motion.div
          ref={textRef}
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            eyebrow="Our Story"
            title="About The Halal Hue"
            align="left"
          />

          <p
            style={{
              marginTop: '1.25rem',
              color: 'var(--ivory-dim)',
              lineHeight: 1.85,
              fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
            }}
          >
            The Halal Hue was founded with a single promise — luxury fragrance
            with complete halal integrity. Every perfume in our collection is
            sourced, verified, and certified to meet the highest halal standards,
            so you can wear your scent with confidence.
          </p>

          <p
            style={{
              marginTop: '1rem',
              color: 'var(--ivory-dim)',
              lineHeight: 1.85,
              fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
            }}
          >
            From rich ouds of the Middle East to delicate florals of the Orient,
            our curated collection brings the world&apos;s finest halal fragrances to
            Bangladesh. We believe luxury and faith are not opposites — they are
            complements.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            <HalalBadge size="md" />
          </div>
        </motion.div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}