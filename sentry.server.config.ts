import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/env';

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: env.NODE_ENV === 'development',
}); 