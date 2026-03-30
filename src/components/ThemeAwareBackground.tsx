'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeAwareBackground() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 12% 10%, rgba(139,92,246,0.24), transparent 33%), radial-gradient(circle at 84% 10%, rgba(59,130,246,0.2), transparent 34%), radial-gradient(circle at 76% 84%, rgba(34,211,238,0.18), transparent 42%), radial-gradient(circle at 18% 78%, rgba(236,72,153,0.12), transparent 45%), linear-gradient(180deg, #f3f6ff 0%, #eaf0ff 58%, #e6edff 100%)'
            : 'radial-gradient(circle at 12% 10%, rgba(139,92,246,0.34), transparent 33%), radial-gradient(circle at 84% 10%, rgba(59,130,246,0.3), transparent 34%), radial-gradient(circle at 76% 84%, rgba(34,211,238,0.22), transparent 42%), radial-gradient(circle at 18% 78%, rgba(236,72,153,0.14), transparent 45%), linear-gradient(180deg, #030712 0%, #040a18 52%, #020611 100%)'
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.11) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(transparent 0%, rgba(56,189,248,0.05) 52%, transparent 100%)',
          backgroundSize: '100% 9px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(242,247,255,0.16) 52%, rgba(232,241,255,0.24) 100%)'
            : 'linear-gradient(180deg, rgba(8,14,32,0.3) 0%, rgba(3,8,20,0.5) 100%)'
        }}
      />
      <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full blur-3xl neural-float" style={{ background: 'rgba(139,92,246,0.24)' }} />
      <div className="absolute -bottom-16 right-0 w-96 h-96 rounded-full blur-3xl neural-float" style={{ background: 'rgba(59,130,246,0.2)', animationDelay: '2s' }} />
      <div className="absolute top-[24%] right-[24%] w-52 h-52 rounded-full blur-3xl neural-float" style={{ background: isLight ? 'rgba(34,211,238,0.14)' : 'rgba(34,211,238,0.16)', animationDelay: '3.5s' }} />
    </div>
  )
} 