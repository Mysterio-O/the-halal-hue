'use client'

import { NAV_LINKS as HOME_NAV, ADMIN_NAV_LINKS as ADMIN_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import React from 'react';


export default function DesktopNav({
    active,
    handleNav,
    onLogout,
    showLogout = false,
    loggingOut = false,
}: {
    active: string | null
    handleNav: (id: string, href?: string) => void
    onLogout?: () => void
    showLogout?: boolean
    loggingOut?: boolean
}) {

    let NAV_LINKS = HOME_NAV;

    const pathname = usePathname();

    const isAdminPath = pathname.startsWith('/admin');

if(isAdminPath){
    NAV_LINKS = ADMIN_NAV;
}

    return (
        <nav
            className="hidden md:flex"
            style={{ gap: '2rem', alignItems: 'center' }}
        >
            {NAV_LINKS.map((link) => {
                const id = link.href.replace('#', '')
                const isActive = active === id
                return (
                    <button
                        key={link.href}
                        onClick={() => handleNav(id, link.href)}
                        className={cn('nav-link', isActive && 'active')}
                    >
                        {link.label}
                        {isActive && (
                            <motion.span
                                layoutId="nav-underline"
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    bottom: -10,
                                    height: 1,
                                    background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                                }}
                            />
                        )}
                    </button>
                )
            })}
            {showLogout && onLogout && (
                <button
                    onClick={onLogout}
                    disabled={loggingOut}
                    style={{
                        padding: '6px 14px',
                        borderRadius: 9999,
                        border: '1px solid var(--border-strong)',
                        background: 'linear-gradient(135deg, rgba(200,168,75,0.14), rgba(61,10,10,0.7))',
                        color: 'var(--gold-light)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.72rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        cursor: loggingOut ? 'default' : 'pointer',
                        opacity: loggingOut ? 0.6 : 1,
                    }}
                >
                    {loggingOut ? 'Signing out...' : 'Logout'}
                </button>
            )}
        </nav>
    )
}
