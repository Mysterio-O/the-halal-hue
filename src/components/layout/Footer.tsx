"use client"
import React from 'react'
import { BRAND_NAME, NAV_LINKS, TAGLINE } from '../../lib/constants'
import { openFacebook } from '../../lib/whatsapp'
import GoldDivider from '../ui/GoldDivider'
import HalalBadge from '../ui/HalalBadge'
import useSmoothScroll from '../../hooks/useSmoothScroll'

export default function Footer() {
  const { scrollTo } = useSmoothScroll()
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'var(--obsidian)',
        borderTop: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="safe-bottom"
    >
      {/* Arabic watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          opacity: 0.025,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 18vw, 160px)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          color: 'var(--gold)',
        }}
      >
        حلال هيو
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '3rem 1.25rem 2rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand column */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--gold)',
                fontSize: '1.15rem',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}
            >
              {BRAND_NAME}
            </div>
            <p
              style={{
                color: 'var(--ivory-dim)',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: '0 0 1rem',
              }}
            >
              {TAGLINE}
            </p>
            <HalalBadge size="sm" />
          </div>

          {/* Quick links */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--gold)',
                fontSize: '0.68rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Quick Links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href.replace('#', ''))}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    color: 'var(--ivory-dim)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold-light)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ivory-dim)' }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order now */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--gold)',
                fontSize: '0.68rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Order Now
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#4ade80',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                WhatsApp
              </a>

              <button
                onClick={openFacebook}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#60a5fa',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>

        <GoldDivider showOrnament />

        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: 'var(--gold-muted)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            © {year} {BRAND_NAME}. All rights reserved.
          </span>
          <span
            style={{
              color: 'var(--border-strong)',
              fontSize: '0.65rem',
            }}
          >
            ✦
          </span>
          <span
            style={{
              color: 'var(--gold-dim)',
              fontSize: '0.78rem',
              fontStyle: 'italic',
            }}
          >
            Luxury · Verified · Halal
          </span>
        </div>
      </div>
    </footer>
  )
}