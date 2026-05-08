import { cn } from '@/lib/utils'
import React from 'react'

interface GoldDividerProps {
  showOrnament?: boolean
  ornament?: string
  className?: string
}

export default function GoldDivider({
  showOrnament = false,
  ornament = '✦',
  className = '',
}: GoldDividerProps) {
  return (
    <div className={cn('gold-divider w-full', className)}>
      {showOrnament && (
        <div className="ornament" aria-hidden="true">
          {ornament}
        </div>
      )}
    </div>
  )
}