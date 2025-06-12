import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
const COUNTER_FILE = '/tmp/visitor_count.txt';

export async function GET(req: NextRequest) {
  let count = 0;
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf8');
    count = parseInt(data, 10) || 0;
  } catch {}
  count++;
  await fs.writeFile(COUNTER_FILE, count.toString(), 'utf8');
  return NextResponse.json({ count });
} 