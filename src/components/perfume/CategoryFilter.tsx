'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Category {
  id: string;
  cat_name: string;
}

interface Props {
  categories: Category[];
  activeCatId?: string;
}

export default function CategoryFilters({ categories, activeCatId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!categories.length) return null;

  function navigate(catId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 on filter change
    params.delete('page');
    if (catId) {
      params.set('cat', catId);
    } else {
      params.delete('cat');
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {/* "All" pill */}
      <button
        onClick={() => navigate(undefined)}
        className={`cat-pill ${!activeCatId ? 'active' : ''}`}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => navigate(cat.id)}
          className={`cat-pill ${activeCatId === cat.id ? 'active' : ''}`}
        >
          {cat.cat_name}
        </button>
      ))}
    </div>
  );
}