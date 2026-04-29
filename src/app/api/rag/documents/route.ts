import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/rag/types';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

const DOCUMENTS_DIR = path.join(process.cwd(), 'src/rag/documents');

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

const documentSchema = z.object({
  id: z.string().min(1).regex(SAFE_ID_REGEX, 'ID must be alphanumeric, hyphens, or underscores only'),
  title: z.string().min(1),
  content: z.string().min(1),
  metadata: z.object({
    source: z.string(),
    type: z.string(),
    date: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

function safePath(id: string): string | null {
  if (!SAFE_ID_REGEX.test(id)) return null;
  const resolved = path.resolve(DOCUMENTS_DIR, `${id}.json`);
  if (!resolved.startsWith(DOCUMENTS_DIR)) return null;
  return resolved;
}

async function requireAuth(req: NextRequest): Promise<boolean> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
}

async function loadDocuments(): Promise<Document[]> {
  try {
    const files = await fs.readdir(DOCUMENTS_DIR);
    const documents: Document[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(DOCUMENTS_DIR, file), 'utf-8');
        const doc = JSON.parse(content);
        documents.push(doc);
      }
    }

    return documents;
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAuth(req))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const documents = await loadDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAuth(req))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const document = await req.json();
    documentSchema.parse(document);

    const filepath = safePath(document.id);
    if (!filepath) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    await fs.writeFile(filepath, JSON.stringify(document, null, 2));

    return NextResponse.json({ success: true, document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error adding document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await requireAuth(req))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }

    const filepath = safePath(params.id);
    if (!filepath) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    try {
      await fs.access(filepath);
    } catch {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await fs.unlink(filepath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 