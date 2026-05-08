import './globals.css'
import React from 'react'
import "@fontsource-variable/cinzel"
import '@fontsource-variable/cormorant'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Halal Hue — Luxury Halal Perfumes',
  description: 'Curated halal-certified luxury perfumes with live pricing. Delivered across Bangladesh.',
  themeColor: '#0D0404',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          background: 'var(--obsidian)',
          color: 'var(--ivory)',
          fontFamily: 'var(--font-body)',
          overscrollBehavior: 'none',
        }}
      >
        <Navbar />
        <main style={{ paddingTop: 'var(--nav-height)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}