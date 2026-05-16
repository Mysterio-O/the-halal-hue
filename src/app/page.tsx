import { Suspense } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import PerfumesSection from '@/components/sections/PerfumesSection';
import AboutSection from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';
import OffersSection from '@/components/sections/OfferSection';

// NO 'use client' here — this must stay a Server Component.
// Each section manages its own client boundary internally.
export default function Page() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={null}>
        <OffersSection />
      </Suspense>
      <Suspense fallback={null}>
        <PerfumesSection />
      </Suspense>
      <AboutSection />
      <ContactSection />
    </>
  );
}