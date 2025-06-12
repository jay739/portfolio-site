'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeAwareBackground() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {(!mounted || theme === 'light') && (
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{width:'100vw',height:'100vh',position:'absolute'}}>
          <defs>
            <linearGradient id="mesh1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e0e7ef" />
            </linearGradient>
            <radialGradient id="mesh2" cx="0.7" cy="0.2" r="0.7">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mesh3" cx="0.2" cy="0.8" r="0.6">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#mesh1)" />
          <ellipse cx="1100" cy="200" rx="400" ry="250" fill="url(#mesh2)" />
          <ellipse cx="400" cy="700" rx="300" ry="180" fill="url(#mesh3)" />
          <path d="M0,700 Q400,800 900,700 T1440,800 V900 H0 Z" fill="#e0e7ef" opacity="0.25" />
        </svg>
      )}
      {mounted && theme === 'dark' && (
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{width:'100vw',height:'100vh',position:'absolute'}}>
          <defs>
            <linearGradient id="mesh1d" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <radialGradient id="mesh2d" cx="0.7" cy="0.2" r="0.7">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mesh3d" cx="0.2" cy="0.8" r="0.6">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#mesh1d)" />
          <ellipse cx="1100" cy="200" rx="400" ry="250" fill="url(#mesh2d)" />
          <ellipse cx="400" cy="700" rx="300" ry="180" fill="url(#mesh3d)" />
          <path d="M0,700 Q400,800 900,700 T1440,800 V900 H0 Z" fill="#334155" opacity="0.18" />
        </svg>
      )}
    </div>
  )
} 