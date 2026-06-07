import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const PODCAST_DIR = path.join(process.cwd(), 'public/images/gallery/podcasts');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[a-zA-Z0-9_\-]+\.mp3$/.test(filename)) {
    return new NextResponse('Invalid filename', { status: 400 });
  }
  const filepath = path.join(PODCAST_DIR, filename);
  try {
    const data = await fs.readFile(filepath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(data.length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
