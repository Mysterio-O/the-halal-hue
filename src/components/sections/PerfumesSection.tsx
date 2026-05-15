import React from 'react';
import Link from 'next/link';
import SectionHeading from '../ui/SectionHeading';
import PriceTicker from '../perfume/PriceTicker';
import PerfumeGrid from '../perfume/PerfumeGrid';
import { getFeaturedProducts } from '@/lib/queries/products';

export default async function PerfumesSection() {
  const products = await getFeaturedProducts();

  return (
    <section id="perfumes" className="py-12 sm:py-20 bg-[var(--crimson-deep)]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading
          eyebrow="Our Collection"
          title="Our Perfume Collections"
          subtitle="Authentic halal fragrances, updated regularly"
          align="center"
        />

        <div className="mt-4 flex items-center justify-center gap-3">
          <div
            className="w-2 h-2 rounded-full bg-[var(--price-up)]"
            style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }}
          />
          <p className="italic text-sm" style={{ color: 'var(--gold-muted)' }}>
            {products.length > 0
              ? `Showing ${products.length} featured fragrances`
              : 'No products available'}
          </p>
        </div>

        <div className="mt-8">
          <PerfumeGrid products={products} />
        </div>

        {/* ── View All button ── */}
        <div className="mt-10 flex justify-center" style={{marginTop:'20px'}}>
          <Link href="/products" className="btn-gold">
            <span>View All Fragrances</span>
            <span style={{ fontSize: '0.9em' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}