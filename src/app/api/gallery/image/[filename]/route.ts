import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const GALLERY_DIR = path.join(process.cwd(), 'public/images/gallery');

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  if (!/^[a-zA-Z0-9_\-]+\.png$/.test(filename)) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  const filepath = path.join(GALLERY_DIR, filename);

  try {
    const data = await fs.readFile(filepath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Content-Disposition': 'inline',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
