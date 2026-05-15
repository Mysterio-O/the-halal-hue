import './globals.css'
import React from 'react'
import "@fontsource-variable/cinzel"
import '@fontsource-variable/cormorant'
import Navbar from '../components/layout/Navbar'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import ConditionalFooter from '@/components/layout/ConditionalFooter'

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