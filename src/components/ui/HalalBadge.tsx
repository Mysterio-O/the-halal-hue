import { cn } from '@/lib/utils'
import React from 'react'

interface HalalBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export default function HalalBadge({ size = 'sm', className }: HalalBadgeProps) {
  return (
    <span
      className={cn(
        'badge-halal',
        size === 'sm' ? 'badge-halal-sm' : 'badge-halal-md',
        className
      )}
    >
      <span aria-hidden="true" style={{ fontSize: size === 'sm' ? '0.6rem' : '0.75rem' }}>✦</span>
      Halal Certified
    </span>
  )
}