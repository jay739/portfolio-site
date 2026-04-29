import Tokens from 'csrf';
import { GetServerSidePropsContext } from 'next';
import { NextApiRequest, NextApiResponse } from 'next';

const tokens = new Tokens();

let secret: string | undefined;
let hasWarnedAboutMissingSecret = false;

function getSecret(): string {
  if (secret) {
    return secret;
  }

  const configuredSecret = process.env.NEXTAUTH_SECRET || process.env.CSRF_SECRET;
  if (!configuredSecret && !hasWarnedAboutMissingSecret && process.env.NEXT_PHASE !== 'phase-production-build') {
    hasWarnedAboutMissingSecret = true;
    console.error('CRITICAL: CSRF_SECRET or NEXTAUTH_SECRET must be set. CSRF tokens will be insecure.');
  }

  const resolvedSecret = configuredSecret || require('crypto').randomBytes(32).toString('hex');
  secret = resolvedSecret;
  return resolvedSecret;
}

export function generateToken() {
  return tokens.create(getSecret());
}

export function verifyToken(token: string) {
  return tokens.verify(getSecret(), token);
}

export function getTokenFromRequest(req: NextApiRequest | GetServerSidePropsContext['req']) {
  return req.headers['csrf-token'] as string;
}

export function setTokenInResponse(res: NextApiResponse | GetServerSidePropsContext['res'], token: string) {
  res.setHeader('csrf-token', token);
}

export function validateCsrfToken(token: string): boolean {
  try {
    return verifyToken(token);
  } catch (error) {
    return false;
  }
}

// Middleware for API routes
export function csrfProtection(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip CSRF check for GET requests
    if (req.method === 'GET') {
      return handler(req, res);
    }

    try {
      const token = req.headers['x-csrf-token'] as string;
      
      if (!token) {
        return res.status(403).json({ error: 'CSRF token missing' });
      }

      if (!verifyToken(token)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }

      // Token is valid, proceed with the request
      return handler(req, res);
    } catch (error) {
      console.error('CSRF validation error:', error);
      return res.status(403).json({ error: 'CSRF validation failed' });
    }
  };
}

// Helper for pages using getServerSideProps
export async function getCsrfToken(context: GetServerSidePropsContext) {
  const token = generateToken();
  
  // Set the token in a cookie
  context.res.setHeader('Set-Cookie', `csrfToken=${token}; Path=/; HttpOnly; SameSite=Strict`);
  
  return token;
} 
