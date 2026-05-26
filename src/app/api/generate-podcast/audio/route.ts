import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PODCAST = process.env.PODCAST_ENDPOINT ?? 'http://100.104.170.37:5050';

// Stream the upstream MP3 through the proxy so the browser never sees the
// Mac Mini's Tailscale URL.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id');
  if (!jobId || !/^[a-fA-F0-9-]{8,64}$/.test(jobId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  // Only forward Range when the client actually sent one — passing an empty
  // string makes werkzeug return 416 Range Not Satisfiable.
  const headers: Record<string, string> = {};
  const range = req.headers.get('range');
  if (range) headers.Range = range;

  let upstream: Response;
  try {
    upstream = await fetch(`${PODCAST}/web/v1/jobs/${encodeURIComponent(jobId)}/audio`, {
      headers,
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return NextResponse.json({ error: 'Podcast service unreachable' }, { status: 503 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Audio not ready' }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': upstream.headers.get('content-length') ?? '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
