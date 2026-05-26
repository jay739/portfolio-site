import { NextRequest, NextResponse } from 'next/server';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PODCAST = process.env.PODCAST_ENDPOINT ?? 'http://100.104.170.37:5050';

// Track one active podcast job per IP (matches the image generator's pattern).
const activeByIp = new Map<string, string>();
const ipByJobId = new Map<string, string>();
const jobStartedAt = new Map<string, number>();

function releaseIp(jobId: string) {
  const ip = ipByJobId.get(jobId);
  if (ip) {
    activeByIp.delete(ip);
    ipByJobId.delete(jobId);
  }
  jobStartedAt.delete(jobId);
}

// Safety sweep: a client that closes the tab mid-job never polls the job to
// completion, so releaseIp() never fires for it. Without this, that IP is
// stuck on HTTP 409 forever. Drop any tracking entry older than 20 minutes —
// longer than the slowest (Bark) generation.
const STALE_MS = 20 * 60 * 1000;
setInterval(() => {
  const cutoff = Date.now() - STALE_MS;
  for (const [jobId, startedAt] of jobStartedAt.entries()) {
    if (startedAt < cutoff) releaseIp(jobId);
  }
}, 5 * 60 * 1000);

const perHour = rateLimit({ interval: 60 * 60 * 1000, uniqueTokenPerInterval: 500 });
const perDay = rateLimit({ interval: 24 * 60 * 60 * 1000, uniqueTokenPerInterval: 500 });

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

interface Speaker {
  name: string;
  gender?: 'male' | 'female';
  tone?: string;
}

function clientIp(req: NextRequest): string {
  return getClientIpFromHeaders(req.headers);
}

function isValidSpeakers(value: unknown): value is Speaker[] {
  if (!Array.isArray(value) || value.length < 2 || value.length > 3) return false;
  return value.every((s) => s && typeof (s as Speaker).name === 'string' && (s as Speaker).name.trim().length > 0);
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  try {
    await perHour.check(2, `podcast:hr:${ip}`);
    await perDay.check(5, `podcast:day:${ip}`);
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded. PDF-to-podcast is GPU-heavy — try again later.' },
      { status: 429 },
    );
  }

  if (activeByIp.has(ip)) {
    return NextResponse.json(
      { error: 'You already have a podcast generating. Wait for it to finish before queuing another.' },
      { status: 409 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Send a PDF file in the "file" field' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'PDF must be > 0 and ≤ 50 MB' }, { status: 400 });
  }

  let speakers: Speaker[] = [
    { name: 'Jamie', gender: 'female', tone: 'warm' },
    { name: 'Taylor', gender: 'male', tone: 'neutral' },
  ];
  let title = 'Generated Podcast';
  let ttsModel: 'piper' | 'kokoro-real' | 'bark' = 'piper';
  let llmModel: string | undefined;

  const cfgRaw = form.get('config');
  if (typeof cfgRaw === 'string' && cfgRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(cfgRaw);
      if (parsed.speakers !== undefined) {
        if (!isValidSpeakers(parsed.speakers)) {
          return NextResponse.json({ error: 'speakers must be 2-3 entries each with a "name"' }, { status: 400 });
        }
        speakers = parsed.speakers;
      }
      if (typeof parsed.title === 'string' && parsed.title.trim().length > 0) {
        title = parsed.title.trim().slice(0, 120);
      }
      if (parsed.tts_model === 'piper' || parsed.tts_model === 'kokoro-real' || parsed.tts_model === 'bark') {
        ttsModel = parsed.tts_model;
      } else if (parsed.tts_model !== undefined) {
        return NextResponse.json({ error: 'tts_model must be piper, kokoro-real, or bark' }, { status: 400 });
      }
      if (typeof parsed.llm_model === 'string' && parsed.llm_model.trim()) {
        // Pinned allow-list so users can't request arbitrary models the host hasn't pulled.
        const allowed = new Set(['qwen2.5:14b', 'gemma3:12b', 'llama3.2:3b', 'qwen2.5-coder:7b', 'deepseek-r1:8b']);
        if (!allowed.has(parsed.llm_model)) {
          return NextResponse.json({ error: 'llm_model not in allowlist' }, { status: 400 });
        }
        llmModel = parsed.llm_model;
      }
    } catch {
      return NextResponse.json({ error: 'config must be valid JSON' }, { status: 400 });
    }
  }

  const upstream = new FormData();
  upstream.append('file', file, file.name);
  upstream.append('config', JSON.stringify({
    speakers, title, tts_model: ttsModel,
    ...(llmModel ? { llm_model: llmModel } : {}),
  }));

  let res: Response;
  try {
    res = await fetch(`${PODCAST}/web/v1/jobs`, {
      method: 'POST',
      body: upstream,
      headers: { 'X-Forwarded-For': ip },
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return NextResponse.json(
      { error: 'Podcast service unreachable. The Mac Mini may be offline.' },
      { status: 503 },
    );
  }

  const payload = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    return NextResponse.json(
      { error: payload.detail || payload.error || 'Upstream rejected the request' },
      { status: res.status },
    );
  }

  const jobId = payload.job_id as string | undefined;
  if (!jobId) {
    return NextResponse.json({ error: 'Upstream did not return a job_id' }, { status: 502 });
  }

  activeByIp.set(ip, jobId);
  ipByJobId.set(jobId, ip);
  jobStartedAt.set(jobId, Date.now());

  return NextResponse.json({
    jobId,
    status: payload.status ?? 'queued',
    estimatedMs: 5 * 60 * 1000,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id');
  if (!jobId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${PODCAST}/web/v1/jobs/${encodeURIComponent(jobId)}`, {
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ status: 'error', error: 'Podcast service unreachable' }, { status: 503 });
  }

  if (res.status === 404) {
    releaseIp(jobId);
    return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: 404 });
  }

  const data = await res.json().catch(() => null);
  if (!data) {
    return NextResponse.json({ status: 'error', error: 'Bad upstream response' }, { status: 502 });
  }

  // Rewrite upstream audio_url to a same-origin path the browser can hit.
  if (data.audio_url && typeof data.audio_url === 'string' && data.audio_url.includes(`/jobs/${jobId}/audio`)) {
    data.audio_url = `/api/generate-podcast/audio?id=${encodeURIComponent(jobId)}`;
  }

  if (data.status === 'done' || data.status === 'error') {
    releaseIp(jobId);
  }

  return NextResponse.json(data);
}
