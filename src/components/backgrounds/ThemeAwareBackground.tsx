'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * Renders both the dark and the light background stacks simultaneously and
 * crossfades them via opacity. This is the only way to get a smooth visual
 * crossfade across radial gradients and grid lines — those are gradient
 * strings, which the browser cannot tween between when one is swapped for the
 * other, so we toggle opacity on the whole layer instead.
 */
export default function ThemeAwareBackground() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Before mount, default to dark visuals to match the ship-default theme.
  const isLight = mounted && resolvedTheme === 'light'

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Dark stack */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ opacity: isLight ? 0 : 1 }}
      >
        <div className="absolute inset-0" style={{ background: '#000000' }} />
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
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 100%)' }}
        />
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full blur-3xl neural-float" style={{ background: 'rgba(255,255,255,0.02)' }} />
        <div className="absolute -bottom-16 right-0 w-96 h-96 rounded-full blur-3xl neural-float" style={{ background: 'rgba(255,255,255,0.015)', animationDelay: '2s' }} />
        <div className="absolute top-[24%] right-[24%] w-52 h-52 rounded-full blur-3xl neural-float" style={{ background: 'rgba(255,255,255,0.012)', animationDelay: '3.5s' }} />
      </div>

      {/* Light stack — warm ivory base + amber accents to echo the dark theme's
         signature glow without losing readability. */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ opacity: isLight ? 1 : 0 }}
      >
        {/* Warm ivory base with a soft top-left highlight for atmospheric depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 80% at 18% -10%, #fff8ec 0%, #faf3e6 42%, #f1ecde 100%)',
          }}
        />
        {/* Diagonal warm sheen — gives the page subtle direction */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(254,224,176,0.35) 0%, rgba(254,224,176,0) 38%, rgba(230,210,178,0) 62%, rgba(220,200,168,0.25) 100%)',
          }}
        />
        {/* Grid lines — warm amber tint mirroring the dark version */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(120,53,15,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,53,15,0.05) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            opacity: 0.6,
          }}
        />
        {/* Bottom vignette for grounding */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 55%, rgba(120,53,15,0.07) 100%)',
          }}
        />
        {/* Amber/peach floating orbs — brand-consistent ambient glow */}
        <div
          className="absolute -top-24 -left-16 w-[26rem] h-[26rem] rounded-full blur-3xl neural-float"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.14), rgba(245,158,11,0) 70%)' }}
        />
        <div
          className="absolute -bottom-24 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl neural-float"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.12), rgba(217,119,6,0) 70%)', animationDelay: '2s' }}
        />
        <div
          className="absolute top-[30%] right-[20%] w-64 h-64 rounded-full blur-3xl neural-float"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.10), rgba(251,146,60,0) 70%)', animationDelay: '3.5s' }}
        />
      </div>
    </div>
  )
}
