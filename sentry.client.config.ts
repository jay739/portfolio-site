import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/env';

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: env.NODE_ENV === 'development',
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
}); 