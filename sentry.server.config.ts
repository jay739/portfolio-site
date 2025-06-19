import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is available
const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
    debug: process.env.NODE_ENV === 'development',
  });
} 