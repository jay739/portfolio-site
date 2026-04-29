import { NextRequest, NextResponse } from 'next/server';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

const imageProxyLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 1000 });

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.endsWith('.local')
  ) {
    return true;
  }

  if (
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('169.254.')
  ) {
    return true;
  }

  const match172 = normalized.match(/^172\.(\d{1,3})\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

function isAllowedUrl(value: string) {
  try {
    const url = new URL(value);
    if (!(url.protocol === 'https:' || url.protocol === 'http:')) {
      return false;
    }

    if (url.username || url.password) {
      return false;
    }

    return !isBlockedHostname(url.hostname);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIpFromHeaders(request.headers);
  try {
    await imageProxyLimiter.check(30, `image-proxy:${ip}`);
  } catch {
    return new NextResponse('Too many image requests', { status: 429 });
  }

  const url = request.nextUrl.searchParams.get('url');

  if (!url || !isAllowedUrl(url)) {
    return new NextResponse('Invalid image URL', { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'jay739-portfolio-image-proxy/1.0',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new NextResponse('Image fetch failed', { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Unsupported upstream content type', { status: 415 });
    }

    const contentLength = Number(upstream.headers.get('content-length') || '0');
    if (contentLength > 5 * 1024 * 1024) {
      return new NextResponse('Image too large', { status: 413 });
    }

    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024) {
      return new NextResponse('Image too large', { status: 413 });
    }

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    });
  } catch {
    return new NextResponse('Image proxy error', { status: 502 });
  }
}
