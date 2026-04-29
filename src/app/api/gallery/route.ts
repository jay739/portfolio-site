import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { timingSafeEqual } from 'crypto';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

const GALLERY_DIR = path.join(process.cwd(), 'public/images/gallery');
const MANIFEST_FILE = path.join(GALLERY_DIR, 'manifest.json');
const MAX_IMAGES = 50;

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

const galleryLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

interface GalleryItem {
  id: string;
  filename: string;
  prompt: string;
  style: string;
  speedMode: string;
  width: number;
  height: number;
  seed: number;
  model: string;
  createdAt: string;
}

async function ensureDir() {
  await fs.mkdir(GALLERY_DIR, { recursive: true });
}

async function readManifest(): Promise<GalleryItem[]> {
  try {
    const data = await fs.readFile(MANIFEST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeManifest(items: GalleryItem[]) {
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const items = await readManifest();
    return NextResponse.json({ images: items });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ images: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    try {
      await galleryLimiter.check(5, `gallery:${ip}`);
    } catch {
      return NextResponse.json({ error: 'Too many saves. Slow down!' }, { status: 429 });
    }

    const body = await req.json();
    const { image, prompt, style, speedMode, width, height, seed, model } = body;

    const secret = body.secret;
    if (!verifySecret(secret)) {
      return NextResponse.json({ error: 'Wrong password!' }, { status: 403 });
    }

    if (!image || typeof image !== 'string' || !image.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    await ensureDir();
    const items = await readManifest();

    if (items.length >= MAX_IMAGES) {
      const oldest = items.pop()!;
      const oldPath = path.join(GALLERY_DIR, oldest.filename);
      await fs.unlink(oldPath).catch(() => {});
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${id}.png`;
    const filepath = path.join(GALLERY_DIR, filename);

    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    await fs.writeFile(filepath, Buffer.from(base64Data, 'base64'));

    const item: GalleryItem = {
      id,
      filename,
      prompt: prompt.slice(0, 3000),
      style: style || 'none',
      speedMode: speedMode || 'balanced',
      width: width || 0,
      height: height || 0,
      seed: seed || 0,
      model: model || '',
      createdAt: new Date().toISOString(),
    };

    items.unshift(item);
    await writeManifest(items);

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    try {
      await galleryLimiter.check(10, `gallery-delete:${ip}`);
    } catch {
      return NextResponse.json({ error: 'Too many delete attempts. Slow down!' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    if (!verifySecret(secret ?? '')) {
      return NextResponse.json({ error: 'Wrong password!' }, { status: 403 });
    }

    const id = searchParams.get('id');
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await ensureDir();
    const items = await readManifest();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const [removed] = items.splice(idx, 1);
    const filepath = path.join(GALLERY_DIR, removed.filename);
    await fs.unlink(filepath).catch(() => {});
    await writeManifest(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
