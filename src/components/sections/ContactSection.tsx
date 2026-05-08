"use client"
import React, { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { openFacebook } from '../../lib/whatsapp'
import SectionHeading from '../ui/SectionHeading'
import GoldDivider from '../ui/GoldDivider'
import { WHATSAPP_NUMBER } from '../../lib/constants'

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="contact"
      style={{
        padding: 'var(--section-padding) 0',
        background: 'linear-gradient(180deg, var(--crimson-deep) 0%, rgba(13,4,4,0.95) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient light */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(200,168,75,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 1.25rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <SectionHeading
          eyebrow="Get In Touch"
          title="Place Your Order"
          subtitle="Choose your preferred platform — we respond fast"
          align="center"
        />

        <div
          ref={ref}
          style={{
            marginTop: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* WhatsApp card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="contact-card"
            style={{
              background: 'rgba(37,211,102,0.05)',
              border: '1px solid rgba(37,211,102,0.2)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--ivory)',
                fontSize: '1.1rem',
                margin: '0 0 0.5rem',
                letterSpacing: '0.04em',
              }}
            >
              WhatsApp
            </h3>
            <p
              style={{
                color: 'var(--ivory-dim)',
                fontStyle: 'italic',
                fontSize: '0.85rem',
                margin: '0 0 1.25rem',
                lineHeight: 1.6,
              }}
            >
              Fastest response
              <br />
              Usually within 1 hour
            </p>
            <button
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`, '_blank')}
              style={{
                width: '100%',
                background: '#25D366',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.25s, transform 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1da851' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#25D366' }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Chat Now →
            </button>
          </motion.div>

          {/* Facebook card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="contact-card"
            style={{
              background: 'rgba(24,119,242,0.05)',
              border: '1px solid rgba(24,119,242,0.2)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(24,119,242,0.1)',
                border: '1px solid rgba(24,119,242,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--ivory)',
                fontSize: '1.1rem',
                margin: '0 0 0.5rem',
                letterSpacing: '0.04em',
              }}
            >
              Facebook
            </h3>
            <p
              style={{
                color: 'var(--ivory-dim)',
                fontStyle: 'italic',
                fontSize: '0.85rem',
                margin: '0 0 1.25rem',
                lineHeight: 1.6,
              }}
            >
              Message us directly
              <br />
              Follow for updates & offers
            </p>
            <button
              onClick={openFacebook}
              style={{
                width: '100%',
                background: '#1877F2',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.25s, transform 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0d6edb' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1877F2' }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Message Us →
            </button>
          </motion.div>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <GoldDivider showOrnament />
        </div>

        <p
          style={{
            marginTop: '1.25rem',
            color: 'var(--gold-dim)',
            fontStyle: 'italic',
            fontSize: '0.82rem',
          }}
        >
          All products are Halal Certified · We deliver across Bangladesh
        </p>
      </div>
    </section>
  )
}