import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AMBER = 'F59E0B';
const RED = 'DC2626';
const CACHE_MS = 60_000;

interface BadgeBody {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  labelColor: string;
  cacheSeconds: number;
}

let cache: { value: BadgeBody; expires: number } | null = null;

const STATIC_CONTAINER_COUNT = Number(process.env.BATCAVE_CONTAINER_COUNT) || 56;

async function probeNetdataAlive(): Promise<boolean> {
  const netdataUrl = process.env.NETDATA_URL || 'https://metrics.jay739.dev';
  const apiKey = process.env.NETDATA_API_KEY;
  if (!apiKey) return false;

  const [username, password] = apiKey.split(':');
  if (!username || !password) return false;

  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
  try {
    const res = await fetch(`${netdataUrl}/api/v1/info`, {
      headers: { Authorization: `Basic ${basicAuth}`, Accept: '*/*' },
      signal: AbortSignal.timeout(2500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json(cache.value, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  }

  const alive = await probeNetdataAlive();
  const body: BadgeBody = alive
    ? {
        schemaVersion: 1,
        label: 'batcave',
        message: `${STATIC_CONTAINER_COUNT} containers · up`,
        color: AMBER,
        labelColor: '0F172A',
        cacheSeconds: 60,
      }
    : {
        schemaVersion: 1,
        label: 'batcave',
        message: 'status unavailable',
        color: RED,
        labelColor: '0F172A',
        cacheSeconds: 60,
      };

  cache = { value: body, expires: Date.now() + CACHE_MS };
  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
