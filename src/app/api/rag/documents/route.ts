import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/rag/types';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const DOCUMENTS_DIR = path.join(process.cwd(), 'src/rag/documents');

const documentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  metadata: z.object({
    source: z.string(),
    type: z.string(),
    date: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Helper function to read and parse document files
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

// GET /api/rag/documents - Retrieve all documents
export async function GET(req: NextRequest) {
  try {
    const documents = await loadDocuments();
    const response = NextResponse.json(documents);
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// POST /api/rag/documents - Add a new document
export async function POST(req: NextRequest) {
  try {
    const document = await req.json();
    documentSchema.parse(document);
    
    // Save document to file
    const filename = `${document.id}.json`;
    await fs.writeFile(
      path.join(DOCUMENTS_DIR, filename),
      JSON.stringify(document, null, 2)
    );

    const response = NextResponse.json({ success: true, document });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error adding document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/rag/documents/[id] - Delete a document
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }

    const { id } = params;
    const filename = `${id}.json`;
    const filepath = path.join(DOCUMENTS_DIR, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete file
    await fs.unlink(filepath);
    const response = NextResponse.json({ success: true });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 