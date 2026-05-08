"use client"
import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import useSmoothScroll from '../../hooks/useSmoothScroll'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

const PARTICLES: Particle[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 8 + i * 7.5 + (i % 3) * 2,
  y: 15 + (i % 5) * 14,
  size: i % 3 === 0 ? 3 : i % 3 === 1 ? 5 : 4,
  duration: 5 + (i % 4) * 1.5,
  delay: i * 0.3,
}))

export default function HeroSection() {
  const { scrollTo } = useSmoothScroll()
  const reduced = useReducedMotion()

  function useIsMounted() {
    return useSyncExternalStore(
      () => () => { },           // subscribe — no-op, never changes
      () => true,               // getSnapshot (client)
      () => false               // getServerSnapshot
    )
  }

  const mounted = useIsMounted()

  return (
    <section
      id="home"
      style={{
        minHeight: '100dvh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1.5rem',
        overflow: 'hidden',
        background: 'var(--obsidian)',
      }}
    >
      {/* Radial ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(200,168,75,0.065) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Secondary deep crimson glow bottom */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '40%',
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(107,15,15,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Arabic watermark */}
      <div className="arabic-watermark" aria-hidden="true">حلال</div>

      {/* Floating particles */}
      {mounted && !reduced && PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          aria-hidden="true"
          animate={{ y: [`-${p.size * 2}px`, `${p.size * 2}px`, `-${p.size * 2}px`] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.id % 2 === 0 ? 'var(--gold)' : 'var(--gold-light)',
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 680,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ width: 24, height: 1, background: 'var(--gold-muted)' }} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--gold-muted)',
            }}
          >
            Halal Certified Luxury Perfumes
          </span>
          <span style={{ width: 24, height: 1, background: 'var(--gold-muted)' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-gold-gradient"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 9vw, 5.5rem)',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          The Halal Hue
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.15rem, 3.5vw, 1.75rem)',
            color: 'var(--ivory)',
            margin: '0.6rem 0 0',
            opacity: 0.9,
          }}
        >
          We Provide Luxury
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={reduced ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            margin: '1.5rem auto',
            maxWidth: 200,
          }}
        />

        {/* Description */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          style={{
            color: 'var(--ivory-dim)',
            fontSize: 'clamp(0.88rem, 2.2vw, 1rem)',
            lineHeight: 1.8,
            margin: '0 0 2rem',
          }}
        >
          Curated halal-certified fragrances with live market pricing.
          <br />
          Refreshed every 30 seconds.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.78 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            className="btn-gold"
            onClick={() => scrollTo('perfumes')}
          >
            <span>Explore Collection</span>
            <span aria-hidden="true" style={{ fontSize: '0.8rem' }}>→</span>
          </button>

          <button
            onClick={() => scrollTo('about')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 24px',
              borderRadius: 9999,
              border: '1px solid rgba(249,243,232,0.12)',
              color: 'var(--ivory-dim)',
              background: 'transparent',
              fontFamily: 'var(--font-display)',
              fontSize: '0.82rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'border-color 0.3s, color 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.color = 'var(--ivory)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(249,243,232,0.12)'
              e.currentTarget.style.color = 'var(--ivory-dim)'
            }}
          >
            Our Story
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <motion.div
          animate={!reduced ? { y: [0, 7, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-muted)',
            }}
          >
            Scroll
          </span>
          <svg
            width="16"
            height="22"
            viewBox="0 0 16 22"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="14"
              height="20"
              rx="7"
              stroke="var(--gold-muted)"
              strokeWidth="1"
            />
            <motion.circle
              cx="8"
              cy="7"
              r="2.5"
              fill="var(--gold)"
              animate={!reduced ? { cy: [7, 13, 7] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}