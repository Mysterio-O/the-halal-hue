import './globals.css'
import React from 'react'
import "@fontsource-variable/cinzel"
import '@fontsource-variable/cormorant'
import Navbar from '../components/layout/Navbar'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import ConditionalFooter from '@/components/layout/ConditionalFooter'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'The Halal Hue - Luxury Halal Perfumes',
    template: '%s | The Halal Hue',
  },
  description: 'Curated halal-certified luxury perfumes with live pricing and authentic ingredients, delivered across Bangladesh.',
  keywords: [
    'halal perfume',
    'attar',
    'luxury fragrance',
    'perfume bangladesh',
    'long lasting perfume',
    'the halal hue',
  ],
  authors: [{ name: 'The Halal Hue' }],
  icons: {
    icon: [
      { url: '/assets/favicon.webp', type: 'image/webp' },
    ],
    shortcut: '/assets/favicon.webp',
    apple: '/assets/logo.webp',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Halal Hue',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'The Halal Hue',
    title: 'The Halal Hue - Luxury Halal Perfumes',
    description: 'Explore halal-certified luxury perfumes with curated notes, transparent pricing, and trusted delivery in Bangladesh.',
    images: [
      {
        url: '/assets/logo.webp',
        width: 1200,
        height: 630,
        alt: 'The Halal Hue Luxury Halal Perfumes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Halal Hue - Luxury Halal Perfumes',
    description: 'Explore halal-certified luxury perfumes with curated notes, transparent pricing, and trusted delivery in Bangladesh.',
    images: ['/assets/logo.webp'],
  },
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
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: 'var(--nav-height)' }}>
            {children}
          </main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  )
}