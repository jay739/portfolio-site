import { NextResponse } from 'next/server';
import {
  formatVisitorPayload,
  getNormalizedVisitorMetrics,
  incrementVisitorMetrics,
} from '@/lib/visitor-metrics';
import type { VisitorMetrics as VisitorData } from '@/lib/visitor-metrics';

export const dynamic = 'force-dynamic';

let memoryCache: { data: VisitorData; cachedAt: number } | null = null;
const READONLY_CACHE_TTL_MS = 30_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const readonly = searchParams.get('readonly') === 'true';

    if (
      readonly &&
      memoryCache &&
      Date.now() - memoryCache.cachedAt < READONLY_CACHE_TTL_MS
    ) {
      const cached = formatVisitorPayload(memoryCache.data);
      return NextResponse.json(
        cached,
        {
          headers: {
            'Cache-Control': 'private, max-age=15, stale-while-revalidate=30'
          }
        }
      );
    }

    const data = readonly ? await getNormalizedVisitorMetrics() : await incrementVisitorMetrics();

    memoryCache = { data: { ...data }, cachedAt: Date.now() };
    
    return NextResponse.json(
      formatVisitorPayload(data),
      {
        headers: {
          'Cache-Control': readonly
            ? 'private, max-age=15, stale-while-revalidate=30'
            : 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('Error handling visitor count:', error);
    const fallback = formatVisitorPayload(await getNormalizedVisitorMetrics());
    return NextResponse.json(fallback);
  }
}
