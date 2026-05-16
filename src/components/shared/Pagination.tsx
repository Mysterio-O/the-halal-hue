'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    function buildHref(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        return `${pathname}?${params.toString()}`;
    }

    // Always show: first, last, current ±1, with ellipsis gaps
    function getPages(): (number | '…')[] {
        const delta = 1;
        const range: number[] = [];
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }
        const pages: (number | '…')[] = [1];
        if (range[0] > 2) pages.push('…');
        pages.push(...range);
        if (range[range.length - 1] < totalPages - 1) pages.push('…');
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    }

    const pages = getPages();

    const base: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 36,
        height: 36,
        borderRadius: 10,
        fontFamily: 'var(--font-display)',
        fontSize: '0.78rem',
        letterSpacing: '0.06em',
        border: '1px solid var(--border)',
        color: 'var(--ivory-dim)',
        background: 'transparent',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        padding: '0 10px',
    };

    return (
        <nav className="flex items-center justify-center gap-1.5 flex-wrap" aria-label="Pagination">
            {/* Prev */}
            {currentPage > 1 ? (
                <Link href={buildHref(currentPage - 1)} style={base}>←</Link>
            ) : (
                <span style={{ ...base, opacity: 0.3, pointerEvents: 'none' }}>←</span>
            )}

            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`e-${i}`} style={{ ...base, border: 'none', opacity: 0.4 }}>…</span>
                ) : (
                    <Link
                        key={p}
                        href={buildHref(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        style={
                            p === currentPage
                                ? {
                                    ...base,
                                    background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                                    color: 'var(--crimson-deep)',
                                    border: '1px solid transparent',
                                    fontWeight: 700,
                                }
                                : base
                        }
                    >
                        {p}
                    </Link>
                )
            )}

            {/* Next */}
            {currentPage < totalPages ? (
                <Link href={buildHref(currentPage + 1)} style={base}>→</Link>
            ) : (
                <span style={{ ...base, opacity: 0.3, pointerEvents: 'none' }}>→</span>
            )}
        </nav>
    );
}