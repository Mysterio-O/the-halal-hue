import React from 'react';
import PerfumeCard from './PerfumeCard';
import { ProductWithDerived } from '@/types/product';

interface PerfumeGridProps {
  products: ProductWithDerived[];
  isLoading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="card-glass flex flex-col overflow-hidden">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-2.5 flex flex-col gap-2">
        <div className="shimmer h-2.5 w-16 rounded" />
        <div className="shimmer h-3.5 w-full rounded" />
        <div className="shimmer h-3 w-3/4 rounded" />
        <div className="flex gap-1 mt-1">
          <div className="shimmer h-5 w-10 rounded-full" />
          <div className="shimmer h-5 w-10 rounded-full" />
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="shimmer h-4 w-12 rounded" />
          <div className="shimmer h-6 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function PerfumeGrid({ products, isLoading = false }: PerfumeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-20">
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            color: 'var(--gold-muted)',
            letterSpacing: '0.12em',
          }}
        >
          NO PRODUCTS AVAILABLE
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <PerfumeCard key={product.id} product={product} />
      ))}
    </div>
  );
}