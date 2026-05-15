import React from 'react'
import GoldDivider from './GoldDivider'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  const isCenter = align === 'center'

  return (
    <div className={cn(isCenter ? 'text-center' : 'text-left')}>
      {eyebrow && (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.68rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-muted)',
            marginBottom: '0.75rem',
            paddingTop:'10px'
          }}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className="text-gold-gradient"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          style={{
            marginTop: '0.65rem',
            color: 'var(--ivory-dim)',
            fontStyle: 'italic',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          }}
        >
          {subtitle}
        </p>
      )}

      <div
        style={{
          marginTop: '1.25rem',
          marginLeft: isCenter ? 'auto' : 0,
          marginRight: isCenter ? 'auto' : 0,
          maxWidth: isCenter ? 100 : '100%',
        }}
      >
        <GoldDivider showOrnament />
      </div>
    </div>
  )
}