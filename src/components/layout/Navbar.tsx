"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import useScrollSpy from '../../hooks/useScrollSpy'
import useSmoothScroll from '../../hooks/useSmoothScroll'
import { BRAND_NAME, NAV_LINKS } from '../../lib/constants'
import HalalBadge from '../ui/HalalBadge'
import DesktopNav from './ControlledNav/DesktopNav'
import { useRouter } from 'next/navigation'
import MobileNav from './ControlledNav/MobileNav'
import useAuth from '../../hooks/useAuth'

const SECTIONS = ['home', 'perfumes', 'about', 'contact'] as const

export default function Navbar() {
  const router = useRouter()
  const active = useScrollSpy([...SECTIONS])
  const { scrollTo } = useSmoothScroll()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNav = (id: string, href?: string) => {
    if (href?.startsWith('/')) {
      router.push(href)
    } else {
      scrollTo(id)
    }
    setOpen(false)
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } finally {
      setLoggingOut(false)
      setOpen(false)
    }
  }

  const showLogout = !loading && !!user

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 'var(--nav-height)',
          backdropFilter: scrolled ? 'blur(16px) saturate(150%)' : 'blur(8px)',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(150%)' : 'blur(8px)',
          background: scrolled
            ? 'rgba(13, 4, 4, 0.9)'
            : 'rgba(13, 4, 4, 0.6)',
          borderBottom: `1px solid ${scrolled ? 'var(--border-strong)' : 'var(--border)'}`,
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            padding: '0 1.25rem',
          }}
        >
          {/* Brand */}
          <button
            onClick={() => handleNav('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                letterSpacing: '0.06em',
                color: 'var(--gold)',
              }}
            >
              {BRAND_NAME}
            </span>
            <span className="hidden sm:inline-flex">
              <HalalBadge size="sm" />
            </span>
          </button>

          {/* Desktop nav */}
          <DesktopNav
            active={active}
            handleNav={handleNav}
            onLogout={handleLogout}
            showLogout={showLogout}
            loggingOut={loggingOut}
          />

          {/* Mobile hamburger */}
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden"
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 10,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={
                  open
                    ? i === 1
                      ? { opacity: 0, scaleX: 0 }
                      : i === 0
                        ? { rotate: 45, y: 10 }
                        : { rotate: -45, y: -10 }
                    : { opacity: 1, scaleX: 1, rotate: 0, y: 0 }
                }
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{
                  display: 'block',
                  width: 18,
                  height: 1.5,
                  background: 'var(--gold)',
                  borderRadius: 9999,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                background: 'rgba(13,4,4,0.6)',
                backdropFilter: 'blur(4px)',
              }}
            />

            <motion.div
              key="drawer"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 45,
                background: 'linear-gradient(180deg, rgba(61,10,10,0.98), rgba(13,4,4,0.99))',
                border: '1px solid var(--border-strong)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 'env(safe-area-inset-bottom)',
                overflow: 'hidden',
              }}
            >
              {/* Drawer handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 9999,
                    background: 'var(--border-strong)',
                  }}
                />
              </div>

            <MobileNav
              active={active}
              handleNav={handleNav}
              onLogout={handleLogout}
              showLogout={showLogout}
              loggingOut={loggingOut}
            />

              <div style={{ padding: '4px 28px 8px', textAlign: 'center' }}>
                <HalalBadge size="sm" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}