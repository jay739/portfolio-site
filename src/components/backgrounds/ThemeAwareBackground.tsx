'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeAwareBackground() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: '#000000'
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          opacity: 0.55,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 100%)'
        }}
      />
      <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full blur-3xl neural-float" style={{ background: 'rgba(255,255,255,0.02)' }} />
      <div className="absolute -bottom-16 right-0 w-96 h-96 rounded-full blur-3xl neural-float" style={{ background: 'rgba(255,255,255,0.015)', animationDelay: '2s' }} />
      <div className="absolute top-[24%] right-[24%] w-52 h-52 rounded-full blur-3xl neural-float" style={{ background: 'rgba(255,255,255,0.012)', animationDelay: '3.5s' }} />
    </div>
  )
}
