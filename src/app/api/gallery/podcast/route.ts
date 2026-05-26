import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { timingSafeEqual } from 'crypto';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PODCAST_ENDPOINT = process.env.PODCAST_ENDPOINT ?? 'http://100.104.170.37:5050';
const PODCAST_DIR = path.join(process.cwd(), 'public/images/gallery/podcasts');
const MANIFEST_FILE = path.join(PODCAST_DIR, 'manifest.json');
const MAX_PODCASTS = 30;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB cap per podcast

function verifySecret(provided: string): boolean {
  const expected = process.env.GALLERY_SECRET;
  if (!expected || !provided) return false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

interface PodcastItem {
  id: string;
  filename: string;            // <id>.mp3 under PODCAST_DIR
  title: string;
  transcript: string;
  speakers: { name: string; gender: string; tone?: string }[];
  ttsModel: string;
  llmModel?: string;
  bytes: number;
  createdAt: string;
}

async function ensureDir() {
  await fs.mkdir(PODCAST_DIR, { recursive: true });
}

async function readManifest(): Promise<PodcastItem[]> {
  try {
    const raw = await fs.readFile(MANIFEST_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeManifest(items: PodcastItem[]) {
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const items = await readManifest();
    return NextResponse.json({ podcasts: items });
  } catch (err) {
    console.error('Podcast gallery GET error:', err);
    return NextResponse.json({ podcasts: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    try {
      await limiter.check(5, `podcast-gallery:${ip}`);
    } catch {
      return NextResponse.json({ error: 'Too many saves. Slow down.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { secret, jobId, title, transcript, speakers, ttsModel, llmModel } = body as {
      secret?: string;
      jobId?: string;
      title?: string;
      transcript?: string;
      speakers?: { name: string; gender: string; tone?: string }[];
      ttsModel?: string;
      llmModel?: string;
    };

    if (!verifySecret(secret ?? '')) {
      return NextResponse.json({ error: 'Wrong password!' }, { status: 403 });
    }
    if (!jobId || !/^[a-fA-F0-9-]{8,64}$/.test(jobId)) {
      return NextResponse.json({ error: 'Invalid jobId' }, { status: 400 });
    }
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!Array.isArray(speakers) || speakers.length < 1) {
      return NextResponse.json({ error: 'speakers must be a non-empty list' }, { status: 400 });
    }

    // Pull the MP3 from the Mac Mini backend over the existing endpoint.
    let upstream: Response;
    try {
      upstream = await fetch(
        `${PODCAST_ENDPOINT}/web/v1/jobs/${encodeURIComponent(jobId)}/audio`,
        { signal: AbortSignal.timeout(30_000) },
      );
    } catch {
      return NextResponse.json({ error: 'Podcast backend unreachable' }, { status: 503 });
    }
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Backend returned ${upstream.status}` },
        { status: 502 },
      );
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: `Audio must be > 0 and <= ${MAX_AUDIO_BYTES} bytes` },
        { status: 400 },
      );
    }

    await ensureDir();
    const items = await readManifest();

    // Evict oldest entries to keep storage bounded.
    while (items.length >= MAX_PODCASTS) {
      const oldest = items.pop()!;
      await fs.unlink(path.join(PODCAST_DIR, oldest.filename)).catch(() => {});
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${id}.mp3`;
    await fs.writeFile(path.join(PODCAST_DIR, filename), buf);

    const item: PodcastItem = {
      id,
      filename,
      title: title.slice(0, 120),
      transcript: (transcript ?? '').slice(0, 20_000),
      speakers: speakers.slice(0, 3).map((s) => ({
        name: String(s.name).slice(0, 40),
        gender: String(s.gender).slice(0, 16),
        ...(s.tone ? { tone: String(s.tone).slice(0, 24) } : {}),
      })),
      ttsModel: typeof ttsModel === 'string' ? ttsModel.slice(0, 32) : 'unknown',
      llmModel: typeof llmModel === 'string' ? llmModel.slice(0, 64) : undefined,
      bytes: buf.length,
      createdAt: new Date().toISOString(),
    };
    items.unshift(item);
    await writeManifest(items);

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error('Podcast gallery POST error:', err);
    return NextResponse.json({ error: 'Failed to save podcast' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    try {
      await limiter.check(10, `podcast-gallery-delete:${ip}`);
    } catch {
      return NextResponse.json({ error: 'Too many delete attempts.' }, { status: 429 });
    }
    const { searchParams } = new URL(req.url);
    if (!verifySecret(searchParams.get('secret') ?? '')) {
      return NextResponse.json({ error: 'Wrong password!' }, { status: 403 });
    }
    const id = searchParams.get('id');
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    await ensureDir();
    const items = await readManifest();
    const idx = items.findIndex((p) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const [removed] = items.splice(idx, 1);
    await fs.unlink(path.join(PODCAST_DIR, removed.filename)).catch(() => {});
    await writeManifest(items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Podcast gallery DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
