import { NextResponse } from 'next/server';
import { formatVisitorPayload, getNormalizedVisitorMetrics } from '@/lib/visitor-metrics';

export async function GET() {
  try {
    const metrics = await getNormalizedVisitorMetrics();
    return NextResponse.json(formatVisitorPayload(metrics));
  } catch (error) {
    console.error('Active users metric error:', error);
    const metrics = await getNormalizedVisitorMetrics();
    return NextResponse.json(formatVisitorPayload(metrics));
  }
}
