import { Tokens } from 'csrf';
import { GetServerSidePropsContext } from 'next';
import { NextApiRequest, NextApiResponse } from 'next';

const tokens = new Tokens();

// Secret key for CSRF token generation (should match your environment variable)
const SECRET = process.env.CSRF_SECRET || 'your-csrf-secret';

export function generateToken() {
  return tokens.create(SECRET);
}

export function validateToken(token: string) {
  return tokens.verify(SECRET, token);
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

      if (!validateToken(token)) {
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