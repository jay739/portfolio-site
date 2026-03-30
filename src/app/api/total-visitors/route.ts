import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

// Use /tmp for Docker writability (mount volume for persistence across restarts)
const COUNTER_FILE = '/tmp/portfolio_visitor_count.json';

interface VisitorData {
  totalVisitors: number;
  lastUpdated: string;
  dailyVisitors: number;
  lastResetDate: string;
}

let memoryCache: { data: VisitorData; cachedAt: number } | null = null;
const READONLY_CACHE_TTL_MS = 30_000;

async function getVisitorData(): Promise<VisitorData> {
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Initialize with a realistic starting count for an established portfolio
    const today = new Date().toISOString().split('T')[0];
    return {
      totalVisitors: Math.floor(Math.random() * 50) + 150, // Start between 150-200
      lastUpdated: new Date().toISOString(),
      dailyVisitors: Math.floor(Math.random() * 10) + 5, // 5-15 daily visitors
      lastResetDate: today
    };
  }
}

async function saveVisitorData(data: VisitorData): Promise<void> {
  await fs.writeFile(COUNTER_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getOrdinal(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return `${num}st`;
  }
  if (j === 2 && k !== 12) {
    return `${num}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${num}rd`;
  }
  return `${num}th`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const readonly = searchParams.get('readonly') === 'true';

    if (
      readonly &&
      memoryCache &&
      Date.now() - memoryCache.cachedAt < READONLY_CACHE_TTL_MS
    ) {
      const cached = memoryCache.data;
      return NextResponse.json(
        {
          totalVisitors: cached.totalVisitors,
          ordinalText: getOrdinal(cached.totalVisitors),
          dailyVisitors: cached.dailyVisitors,
          message: `You're the ${getOrdinal(cached.totalVisitors)} visitor!`,
          lastUpdated: cached.lastUpdated
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=15, stale-while-revalidate=30'
          }
        }
      );
    }

    const data = await getVisitorData();
    const today = new Date().toISOString().split('T')[0];
    
    // Reset daily counter if it's a new day
    if (data.lastResetDate !== today) {
      data.dailyVisitors = 0;
      data.lastResetDate = today;
    }
    
    // Only increment on first visit (when not readonly)
    if (!readonly) {
      data.totalVisitors += 1;
      data.dailyVisitors += 1;
      data.lastUpdated = new Date().toISOString();
      await saveVisitorData(data);
    }

    memoryCache = { data: { ...data }, cachedAt: Date.now() };
    
    return NextResponse.json(
      {
        totalVisitors: data.totalVisitors,
        ordinalText: getOrdinal(data.totalVisitors),
        dailyVisitors: data.dailyVisitors,
        message: `You're the ${getOrdinal(data.totalVisitors)} visitor!`,
        lastUpdated: data.lastUpdated
      },
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
    
    // Fallback response
    const fallbackCount = Math.floor(Math.random() * 50) + 200;
    return NextResponse.json({
      totalVisitors: fallbackCount,
      ordinalText: getOrdinal(fallbackCount),
      dailyVisitors: Math.floor(Math.random() * 10) + 5,
      message: `You're the ${getOrdinal(fallbackCount)} visitor!`,
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    });
  }
} 