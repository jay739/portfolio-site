import { NextRequest, NextResponse } from 'next/server';
import {
  formatVisitorPayload,
  getNormalizedVisitorMetrics,
  incrementVisitorMetrics,
} from '@/lib/visitor-metrics';

// GET returns current count without mutating state
export async function GET(_req: NextRequest) {
  const metrics = await getNormalizedVisitorMetrics();
  return NextResponse.json(formatVisitorPayload(metrics));
}

// POST increments and returns new count
export async function POST(_req: NextRequest) {
  const metrics = await incrementVisitorMetrics();
  return NextResponse.json(formatVisitorPayload(metrics));
}
