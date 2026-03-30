export const ANIMATION = {
  TYPEWRITER: {
    TYPE_SPEED: 90,
    DELETE_SPEED: 40,
    PAUSE_TIME: 900,
    INITIAL_DELAY: 400,
  },
  MOTION: {
    HERO: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8 },
    },
  },
  CONFETTI: {
    PARTICLE_COUNT: 120,
    SPREAD: 80,
    ORIGIN: { y: 0.7 },
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ACCESSIBILITY = {
  REDUCED_MOTION: 'prefers-reduced-motion: reduce',
  HIGH_CONTRAST: 'prefers-contrast: more',
} as const;

export const SEO = {
  SITE_URL: 'https://jay739.dev',
  SITE_NAME: 'Jayakrishna Konda Portfolio',
  DEFAULT_TITLE: 'Jayakrishna Konda - Portfolio',
  DEFAULT_DESCRIPTION: 'Full Stack Developer & DevOps Engineer specializing in AI/ML, Data Science, and Home Server solutions.',
} as const; 