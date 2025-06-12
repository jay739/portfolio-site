import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API URLs and Keys
  NETDATA_URL: z.string().url(),
  NETDATA_API_KEY: z.string().min(32), // Require a strong API key
  NEXTAUTH_SECRET: z.string().min(32), // Require a strong secret for JWT
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Security
  LOG_SERVICE_URL: z.string().url().optional(),
  LOG_SERVICE_KEY: z.string().optional(),
  ALERT_WEBHOOK_URL: z.string().url().optional(),
  
  // Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Google Analytics (if used)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  
  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().optional(),
  
  // Other optional configurations
  CORS_ORIGINS: z.string().optional(),
  MAX_REQUESTS_PER_MINUTE: z.string().transform(Number).default('60'),
  SESSION_MAX_AGE: z.string().transform(Number).default('86400'), // 24 hours in seconds
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'));
      
      const invalidVars = error.errors
        .filter(err => err.code !== 'invalid_type' || err.received !== 'undefined')
        .map(err => `${err.path.join('.')}: ${err.message}`);
      
      console.error('❌ Invalid environment variables:');
      
      if (missingVars.length > 0) {
        console.error('\nMissing required variables:');
        missingVars.forEach(variable => console.error(`  - ${variable}`));
      }
      
      if (invalidVars.length > 0) {
        console.error('\nInvalid variables:');
        invalidVars.forEach(variable => console.error(`  - ${variable}`));
      }
      
      console.error('\nPlease check your .env file and ensure all required variables are set correctly.');
    } else {
      console.error('❌ Unexpected error validating environment variables:', error);
    }
    
    process.exit(1);
  }
}

export const env = validateEnv(); 