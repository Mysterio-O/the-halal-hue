'use client'

import { NAV_LINKS as HOME_NAV, ADMIN_NAV_LINKS as ADMIN_NAV } from '@/lib/constants';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import React from 'react'

export default function MobileNav({ active, handleNav }: { active: string | null, handleNav: (id: string, href?: string) => void }) {

    let NAV_LINKS = HOME_NAV;

    const pathname = usePathname();

    const isAdminPath = pathname.startsWith('/admin');

    if (isAdminPath) {
        NAV_LINKS = ADMIN_NAV;
    }

    return (
        <div style={{ padding: '8px 0 24px' }}>
            {NAV_LINKS.map((link, i) => {
                const id = link.href.replace('#', '')
                const isActive = active === id
                return (
                    <motion.button
                        key={link.href}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 + 0.1 }}
                        onClick={() => handleNav(id, link.href)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '16px 28px',
                            background: 'none',
                            border: 'none',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: isActive ? 'var(--gold-light)' : 'var(--ivory-dim)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            gap: 12,
                        }}
                    >
                        {isActive && (
                            <span
                                style={{
                                    width: 3,
                                    height: 18,
                                    borderRadius: 9999,
                                    background: 'linear-gradient(180deg, var(--gold-light), var(--gold))',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        {link.label}
                    </motion.button>
                )
            })}
        </div>
    )
}
