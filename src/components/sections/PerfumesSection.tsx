"use client"
import React from 'react'
import SectionHeading from '../ui/SectionHeading';
import { getTimeSince } from '../../lib/utils';
import PriceTicker from '../perfume/PriceTicker';
import PerfumeGrid from '../perfume/PerfumeGrid';
import { Perfume } from '../../types/perfume';

export default function PerfumesSection({ perfumes, isLoading, lastUpdated }: { perfumes: Perfume[]; isLoading: boolean; lastUpdated: Date | null }){
  return (
    <section id="perfumes" className="py-12 sm:py-20 bg-[var(--crimson-deep)]">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeading eyebrow="Our Collection" title="Live Perfume Prices" subtitle="Prices refresh automatically every 30 seconds" align="center" />

        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--price-up)] animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
          <div className="text-[var(--gold-muted)] italic text-sm">{isLoading ? 'Refreshing...' : `Prices are live · ${lastUpdated ? getTimeSince(lastUpdated.toISOString()) : ''}`}</div>
        </div>

        <div className="mt-8 -mx-4 sm:-mx-6">
          <PriceTicker perfumes={perfumes} />
        </div>

        <div className="mt-8">
          <PerfumeGrid perfumes={perfumes} isLoading={isLoading} lastUpdated={lastUpdated} />
        </div>
      </div>
    </section>
  )
}
