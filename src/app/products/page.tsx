import React, { Suspense } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/queries/products';
import { getActiveCategories } from '@/lib/queries/categories';
import PerfumeGrid from '@/components/perfume/PerfumeGrid';
import CategoryFilters from '@/components/perfume/CategoryFilter';
import Pagination from '@/components/shared/Pagination';


const PER_PAGE = 16;

interface Props {
    searchParams: Promise<{ page?: string; cat?: string }>;
}

export const metadata = {
    title: 'All Fragrances | The Halal Hue',
    description: 'Browse our full collection of authentic halal perfumes.',
};

export default async function ProductsPage({ searchParams }: Props) {
    const { page: pageParam, cat: catParam } = await searchParams;

    const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
    const catId = catParam ?? undefined;

    const [{ products, total, totalPages }, categories] = await Promise.all([
        getProducts({ page, perPage: PER_PAGE, catId }),
        getActiveCategories(),
    ]);

    return (
        <div
            className="min-h-screen"
            style={{ background: 'var(--obsidian)', paddingTop: 'var(--nav-height)' }}
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* ── Header ── */}
                <div className="mb-8">
                    <Link
                        href="/#perfumes"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-muted)',
                        }}
                    >
                        ← Home
                    </Link>

                    <h1
                        className="text-gold-shimmer mt-4"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                            letterSpacing: '0.04em',
                            lineHeight: 1.2,
                        }}
                    >
                        All Fragrances
                    </h1>

                    <p
                        className="mt-2"
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem',
                            color: 'var(--ivory-dim)',
                        }}
                    >
                        {total > 0
                            ? `${total} authentic halal perfume${total === 1 ? '' : 's'}`
                            : 'No products found'}
                    </p>
                </div>

                {/* ── Gold divider ── */}
                <div className="gold-divider mb-8">
                    <span className="ornament">✦</span>
                </div>

                {/* ── Category filter pills — client component (useRouter) ── */}
                <Suspense fallback={null}>
                    <CategoryFilters categories={categories} activeCatId={catId} />
                </Suspense>

                {/* ── Product grid ── */}
                <div className="mt-8">
                    <PerfumeGrid products={products} />
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="mt-12">
                        <Suspense fallback={null}>
                            <Pagination currentPage={page} totalPages={totalPages} />
                        </Suspense>
                    </div>
                )}

                {/* ── Result count below pagination ── */}
                {total > 0 && (
                    <p
                        className="mt-4 text-center"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.1em',
                            color: 'var(--gold-muted)',
                            textTransform: 'uppercase',
                            opacity: 0.7,
                        }}
                    >
                        Page {page} of {totalPages} · {total} products
                    </p>
                )}
            </div>
        </div>
    );
}