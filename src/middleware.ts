import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/api/visitors'
];

// Paths that are always public (no NextAuth required)
const PUBLIC_PATHS = [
  '/api/auth',
  '/api/ai-news',
  '/api/active-users',
  '/api/contact',
  '/api/total-visitors',
  '/api/csrf',
  '/api/netdata'  // Netdata proxy uses NETDATA_API_KEY, not NextAuth
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Basic security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // API-specific headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    
    // Check if the path requires authentication
    const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path));
    const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path));
    
    if (requiresAuth && !isPublic) {
      // Verify authentication
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      });
      
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer'
            }
          }
        );
      }
      
      // Role available via token in downstream handlers — not exposed in response headers
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
}; 