'use client'

import { NAV_LINKS as HOME_NAV, ADMIN_NAV_LINKS as ADMIN_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {motion} from 'motion/react';
import React from 'react';


export default function DesktopNav({active, handleNav}:{active: string | null, handleNav: (id: string, href?: string) => void}) {

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
        </nav>
    )
}
