import { z } from 'zod';

// Schema for environment variables that are available on both client and server
const commonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NETDATA_URL: z.string().url(),
});

// Schema for environment variables that are only available on the server
const serverEnvSchema = commonEnvSchema.extend({
  // Next Auth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string(),

  // API Keys
  NETDATA_API_KEY: z.string().min(1),
  NEWS_API_KEY: z.string(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),

  // Google Analytics
  GA4_PROPERTY_ID: z.string(),
  GA_SERVICE_ACCOUNT_KEY_PATH: z.string().default('./service-account.json'),
  
  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().optional(),
  LOG_SERVICE_URL: z.string().optional(),
  
  // Other optional configurations
  CORS_ORIGINS: z.string().optional(),
  MAX_REQUESTS_PER_MINUTE: z.string().transform(Number).default('60'),
  SESSION_MAX_AGE: z.string().transform(Number).default('86400'), // 24 hours in seconds
});

function formatErrors(errors: z.ZodError) {
  return Object.entries(errors.flatten().fieldErrors)
    .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
    .join('\n');
}

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NETDATA_URL: process.env.NETDATA_URL || 'https://metrics.jay739.dev',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NETDATA_API_KEY: process.env.NETDATA_API_KEY,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: process.env.SENTRY_DSN,
  GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID,
  GA_SERVICE_ACCOUNT_KEY_PATH: process.env.GA_SERVICE_ACCOUNT_KEY_PATH,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_ORG: process.env.SENTRY_ORG,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_FILE_PATH: process.env.LOG_FILE_PATH,
  LOG_SERVICE_URL: process.env.LOG_SERVICE_URL,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  MAX_REQUESTS_PER_MINUTE: process.env.MAX_REQUESTS_PER_MINUTE,
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
};

// Use different schemas based on whether we're on the client or server
export const env = typeof window === 'undefined' 
  ? serverEnvSchema.parse(processEnv)
  : commonEnvSchema.parse(processEnv); 