"use client"
import React from 'react'
import useLivePrices from '../hooks/useLivePrices'
import HeroSection from '../components/sections/HeroSection'
import PerfumesSection from '../components/sections/PerfumesSection'
import AboutSection from '../components/sections/AboutSection'
import ContactSection from '../components/sections/ContactSection'
import DUMMY_PERFUMES from '@/data/perfumes'

export default function Page(){
  // const { perfumes, isLoading, lastUpdated } = useLivePrices()

  return (
    <>
      <HeroSection />
      <PerfumesSection perfumes={DUMMY_PERFUMES} isLoading={false} lastUpdated={null} />
      <AboutSection />
      <ContactSection />
    </>
  )
}
