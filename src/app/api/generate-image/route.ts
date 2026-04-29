import { NextRequest, NextResponse } from 'next/server';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory job metadata (prompt_id → request context). Keyed to ComfyUI's prompt_id.
// Small map, entries cleaned up when client polls a completed job.
interface JobMeta {
  speedMode: SpeedMode;
  quality: Quality;
  aspect: AspectRatio;
  style: Style;
  seed: number;
  steps: number;
  width: number;
  height: number;
  model: string;
  vae: string;
  startedAt: number;
}
const jobs = new Map<string, JobMeta>();
// Track one active job per IP (promptId → ip and ip → promptId)
const activeByIp = new Map<string, string>(); // ip → promptId
const ipByPromptId = new Map<string, string>(); // promptId → ip

function releaseIp(promptId: string) {
  const ip = ipByPromptId.get(promptId);
  if (ip) {
    activeByIp.delete(ip);
    ipByPromptId.delete(promptId);
  }
}

// Cleanup: drop entries older than 15 min
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, meta] of jobs.entries()) {
    if (meta.startedAt < cutoff) {
      releaseIp(id);
      jobs.delete(id);
    }
  }
}, 5 * 60 * 1000);

const COMFYUI = process.env.COMFYUI_ENDPOINT ?? 'http://localhost:8188';
// Per-mode timeouts (SDXL on M4 MPS can take 150s+ plus 30s model load)
const TIMEOUTS: Record<'fast' | 'balanced' | 'quality', number> = {
  fast: 90_000,
  balanced: 180_000,
  quality: 300_000,
};

type ModelFamily = 'sd' | 'flux';
type SpeedMode = 'fast' | 'balanced' | 'quality';
type Quality = 'low' | 'medium' | 'high';
type AspectRatio = 'square' | 'portrait' | 'landscape';
type Style = 'none' | 'anime' | 'cinematic' | 'pixel-art' | 'cyberpunk' | 'photorealistic';

interface ModelPreset {
  ckpt: string;
  baseSteps: number;
  cfg: number;
  sampler: string;
  scheduler: string;
  maxSide: number;
  // SD 1.5 family supports the external VAE; SDXL has its own baked-in
  externalVae?: string;
  // Whether auto-negative embeddings (e.g. EasyNegative) work with this checkpoint family
  supportsSd15Embeddings?: boolean;
}

const MODELS: Record<SpeedMode, ModelPreset> = {
  fast: {
    ckpt: 'sd_turbo.safetensors',
    baseSteps: 2,
    cfg: 1,
    sampler: 'euler_ancestral',
    scheduler: 'simple',
    maxSide: 512,
    supportsSd15Embeddings: true,
  },
  balanced: {
    ckpt: 'v1-5-pruned-emaonly.safetensors',
    baseSteps: 20,
    cfg: 7,
    sampler: 'euler',
    scheduler: 'normal',
    maxSide: 640,
    externalVae: 'vae-ft-mse-840000-ema-pruned.safetensors',
    supportsSd15Embeddings: true,
  },
  quality: {
    ckpt: 'sd_xl_turbo_1.0_fp16.safetensors',
    baseSteps: 6,
    cfg: 1.5,
    sampler: 'euler_ancestral',
    scheduler: 'simple',
    maxSide: 1024,
    // SDXL uses its own VAE and its own embedding format — skip SD 1.5 embeddings
  },
};

const QUALITY_MULT: Record<Quality, number> = { low: 0.5, medium: 1, high: 1.5 };

// Prompt-style augmentation (no LoRAs = no extra RAM, works across all checkpoints).
// { add: appended to positive prompt, neg: appended to negative prompt }
const STYLE_TOKENS: Record<Style, { add: string; neg: string }> = {
  none: { add: '', neg: '' },
  anime: {
    add: 'anime style, manga, cel shading, vibrant colors, detailed line art, studio ghibli influence',
    neg: 'photorealistic, 3d render, western cartoon',
  },
  cinematic: {
    add: 'cinematic lighting, film grain, anamorphic lens, dramatic shadows, shallow depth of field, color graded',
    neg: 'flat lighting, overexposed',
  },
  'pixel-art': {
    add: 'pixel art, 8-bit, 16-bit, retro game sprite, limited color palette, crisp pixels',
    neg: 'smooth shading, anti-aliasing, photorealistic, blurry',
  },
  cyberpunk: {
    add: 'cyberpunk, neon lights, rain-soaked streets, blade runner aesthetic, holographic signs, futuristic city, moody atmosphere',
    neg: 'rural, daylight, pastoral',
  },
  photorealistic: {
    add: 'photorealistic, ultra detailed, 85mm lens, natural lighting, high dynamic range, sharp focus',
    neg: 'illustration, cartoon, anime, painting',
  },
};

// Auto-applied negative embeddings for SD 1.5 family (EasyNegative lives in models/embeddings/)
const SD15_AUTO_NEG = 'embedding:EasyNegative';
// Generic quality negatives auto-applied to every generation
const QUALITY_AUTO_NEG =
  'blurry, low quality, bad anatomy, extra fingers, extra limbs, deformed face, distorted eyes, watermark, text';

function dimsFor(aspect: AspectRatio, max: number): { width: number; height: number } {
  // Snap to 64px multiples (SD requirement)
  const snap = (n: number) => Math.max(256, Math.round(n / 64) * 64);
  if (aspect === 'portrait') return { width: snap(max * 0.75), height: snap(max) };
  if (aspect === 'landscape') return { width: snap(max), height: snap(max * 0.75) };
  return { width: snap(max), height: snap(max) };
}

function buildWorkflow(
  prompt: string,
  negativePrompt: string,
  seed: number,
  preset: ModelPreset,
  steps: number,
  width: number,
  height: number,
) {
  // Pick VAE source: external VAELoader if set, else the one bundled in the checkpoint
  const vaeRef: [string, number] = preset.externalVae ? ['10', 0] : ['4', 2];

  const workflow: Record<string, any> = {
    '3': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps,
        cfg: preset.cfg,
        sampler_name: preset.sampler,
        scheduler: preset.scheduler,
        denoise: 1,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0],
      },
    },
    '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: preset.ckpt } },
    '5': { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
    '6': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { text: negativePrompt, clip: ['4', 1] } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: vaeRef } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'portfolio_gen', images: ['8', 0] } },
  };

  if (preset.externalVae) {
    workflow['10'] = { class_type: 'VAELoader', inputs: { vae_name: preset.externalVae } };
  }

  return workflow;
}

function buildFluxWorkflow(
  prompt: string,
  seed: number,
  width: number,
  height: number,
) {
  return {
    '1': { class_type: 'UnetLoaderGGUF', inputs: { unet_name: 'flux1-schnell-Q2_K.gguf' } },
    '2': { class_type: 'DualCLIPLoader', inputs: { clip_name1: 'clip_l.safetensors', clip_name2: 't5xxl_fp8_e4m3fn.safetensors', type: 'flux' } },
    '3': { class_type: 'VAELoader', inputs: { vae_name: 'ae.safetensors' } },
    '4': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['2', 0] } },
    '5': { class_type: 'FluxGuidance', inputs: { conditioning: ['4', 0], guidance: 3.5 } },
    '6': { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
    '7': {
      class_type: 'KSampler',
      inputs: {
        seed,
        steps: 4,
        cfg: 1.0,
        sampler_name: 'euler',
        scheduler: 'simple',
        denoise: 1,
        model: ['1', 0],
        positive: ['5', 0],
        negative: ['4', 0],
        latent_image: ['6', 0],
      },
    },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['7', 0], vae: ['3', 0] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'portfolio_flux', images: ['8', 0] } },
  };
}

async function fetchHistoryImage(
  promptId: string,
): Promise<{ filename: string; subfolder: string } | null> {
  const res = await fetch(`${COMFYUI}/history/${promptId}`, { signal: AbortSignal.timeout(5_000) });
  if (!res.ok) return null;
  const history = await res.json();
  const entry = history[promptId];
  if (!entry?.outputs) return null;
  for (const output of Object.values(entry.outputs) as any[]) {
    if (output.images?.length) return output.images[0];
  }
  return null;
}

// Rate limits
const perMinute = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
const perHour = rateLimit({ interval: 60 * 60 * 1000, uniqueTokenPerInterval: 500 });
const perDayGlobal = rateLimit({ interval: 24 * 60 * 60 * 1000, uniqueTokenPerInterval: 2 });

// Cap concurrent queued/running jobs on ComfyUI (Mac Mini is single-tenant)
const MAX_IN_FLIGHT = 2; // 1 running + 1 pending

const BANNED = /\b(nsfw|nude|naked|porn|sex|explicit|gore|child|underage|loli|shota)\b/i;

function clientIp(req: NextRequest): string {
  return getClientIpFromHeaders(req.headers);
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // Per-IP rate limits
  try {
    await perMinute.check(2, `img:min:${ip}`);
    await perHour.check(10, `img:hr:${ip}`);
    await perDayGlobal.check(200, 'img:day:global');
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 },
    );
  }

  // Reject if this IP already has an active generation (multi-tab protection)
  if (activeByIp.has(ip)) {
    return NextResponse.json(
      { error: 'You already have a generation in progress. Please wait for it to finish.' },
      { status: 409 },
    );
  }

  // Check ComfyUI queue depth before accepting
  try {
    const qRes = await fetch(`${COMFYUI}/queue`, { signal: AbortSignal.timeout(5_000) });
    if (qRes.ok) {
      const q = await qRes.json();
      const depth = (q.queue_running?.length ?? 0) + (q.queue_pending?.length ?? 0);
      if (depth >= MAX_IN_FLIGHT) {
        return NextResponse.json(
          { error: 'GPU busy — another image is generating. Try again in ~30s.' },
          { status: 503 },
        );
      }
    }
  } catch {
    return NextResponse.json({ error: 'ComfyUI unreachable' }, { status: 503 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    prompt,
    negativePrompt = '',
    modelFamily = 'sd',
    speedMode = 'balanced',
    quality = 'medium',
    aspect = 'square',
    style = 'none',
    seed: userSeed,
  } = body as {
    prompt?: string;
    negativePrompt?: string;
    modelFamily?: ModelFamily;
    speedMode?: SpeedMode;
    quality?: Quality;
    aspect?: AspectRatio;
    style?: Style;
    seed?: number;
  };

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'Prompt must be at least 3 characters' }, { status: 400 });
  }
  if (prompt.length > 3000) {
    return NextResponse.json({ error: 'Prompt too long (max 3000 chars)' }, { status: 400 });
  }
  if (!['sd', 'flux'].includes(modelFamily)) {
    return NextResponse.json({ error: 'Invalid modelFamily' }, { status: 400 });
  }
  if (BANNED.test(prompt) || BANNED.test(negativePrompt)) {
    return NextResponse.json({ error: 'Prompt violates content policy' }, { status: 400 });
  }
  if (!(speedMode in MODELS)) {
    return NextResponse.json({ error: 'Invalid speedMode' }, { status: 400 });
  }
  if (!(quality in QUALITY_MULT) || !['square', 'portrait', 'landscape'].includes(aspect)) {
    return NextResponse.json({ error: 'Invalid quality or aspect' }, { status: 400 });
  }
  if (!(style in STYLE_TOKENS)) {
    return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
  }

  try {
    const seed =
      Number.isFinite(userSeed) && userSeed! >= 0
        ? Math.floor(userSeed!)
        : Math.floor(Math.random() * 2 ** 32);

    const styleTokens = STYLE_TOKENS[style];
    const finalPrompt = [prompt.trim(), styleTokens.add].filter(Boolean).join(', ');

    let workflow: Record<string, any>;
    let steps: number;
    let width: number;
    let height: number;
    let modelName: string;
    let vaeUsed: string;

    if (modelFamily === 'flux') {
      // FLUX.1-schnell: 4-step, up to 1024px, no negative prompt
      const maxSide = 1024;
      ({ width, height } = dimsFor(aspect, maxSide));
      steps = 4;
      modelName = 'flux1-schnell-Q2_K.gguf';
      vaeUsed = 'ae.safetensors';
      workflow = buildFluxWorkflow(finalPrompt, seed, width, height);
    } else {
      const preset = MODELS[speedMode];
      steps = Math.max(1, Math.round(preset.baseSteps * QUALITY_MULT[quality]));
      ({ width, height } = dimsFor(aspect, preset.maxSide));
      modelName = preset.ckpt;
      vaeUsed = preset.externalVae ?? 'bundled';
      const negPieces = [
        QUALITY_AUTO_NEG,
        negativePrompt.trim(),
        styleTokens.neg,
        preset.supportsSd15Embeddings ? SD15_AUTO_NEG : '',
      ].filter(Boolean);
      const finalNegative = negPieces.join(', ');
      workflow = buildWorkflow(finalPrompt, finalNegative, seed, preset, steps, width, height);
    }

    const queueRes = await fetch(`${COMFYUI}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!queueRes.ok) {
      const text = await queueRes.text().catch(() => '');
      console.error('ComfyUI rejected workflow:', text.slice(0, 500));
      return NextResponse.json(
        { error: 'Image generation service rejected the request. Please try a different prompt.' },
        { status: 503 },
      );
    }

    const queued = await queueRes.json();
    if (!queued.prompt_id) {
      console.error('ComfyUI validation failed:', JSON.stringify(queued.node_errors ?? queued).slice(0, 500));
      return NextResponse.json(
        { error: 'Image generation validation failed. Please try a different prompt.' },
        { status: 502 },
      );
    }

    // Register this IP as busy for the duration of this job
    activeByIp.set(ip, queued.prompt_id);
    ipByPromptId.set(queued.prompt_id, ip);

    // Store meta so GET can return it alongside the finished image
    jobs.set(queued.prompt_id, {
      speedMode,
      quality,
      aspect,
      style,
      seed,
      steps,
      width,
      height,
      model: modelName,
      vae: vaeUsed,
      startedAt: Date.now(),
    });

    const estimatedMs = modelFamily === 'flux' ? 600_000 : TIMEOUTS[speedMode];

    // Return immediately — client polls GET ?id=<prompt_id>
    return NextResponse.json({
      promptId: queued.prompt_id,
      status: 'queued',
      estimatedMs,
      meta: {
        seed,
        width,
        height,
        steps,
        model: modelName,
        vae: vaeUsed,
        speedMode: modelFamily === 'flux' ? 'flux' : speedMode,
        quality,
        aspect,
        style,
      },
    });
  } catch (err) {
    console.error('Image queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Poll job status; returns the image (base64) once ComfyUI finishes.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const promptId = searchParams.get('id');
  if (!promptId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Check history first — if the job finished, return the image
    const imageInfo = await fetchHistoryImage(promptId);
    if (imageInfo) {
      if (!/^[\w\-. ]+$/.test(imageInfo.filename) || !/^[\w\-./]*$/.test(imageInfo.subfolder ?? '')) {
        return NextResponse.json({ status: 'error', error: 'Invalid image path from upstream' }, { status: 500 });
      }
      const imageRes = await fetch(
        `${COMFYUI}/view?filename=${encodeURIComponent(imageInfo.filename)}&subfolder=${encodeURIComponent(imageInfo.subfolder ?? '')}&type=output`,
        { signal: AbortSignal.timeout(15_000) },
      );
      if (!imageRes.ok) {
        return NextResponse.json({ status: 'error', error: 'Failed to fetch image' }, { status: 500 });
      }
      const buffer = await imageRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      releaseIp(promptId);

      // Fire-and-forget unload to free M4 unified memory
      fetch(`${COMFYUI}/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unload_models: true, free_memory: true }),
        signal: AbortSignal.timeout(5_000),
      }).catch(() => {});

      const meta = jobs.get(promptId);
      jobs.delete(promptId);

      return NextResponse.json({
        status: 'done',
        image: `data:image/png;base64,${base64}`,
        promptId,
        ...(meta ?? {}),
      });
    }

    // Still pending — report queue position
    const qRes = await fetch(`${COMFYUI}/queue`, { signal: AbortSignal.timeout(5_000) });
    if (!qRes.ok) {
      return NextResponse.json({ status: 'error', error: 'ComfyUI unreachable' }, { status: 503 });
    }
    const queue = await qRes.json();
    const running: any[] = queue.queue_running ?? [];
    const pending: any[] = queue.queue_pending ?? [];

    // ComfyUI queue entries look like [number, prompt_id, ...]
    const isRunning = running.some((e) => Array.isArray(e) && e[1] === promptId);
    const pendingIdx = pending.findIndex((e) => Array.isArray(e) && e[1] === promptId);

    if (isRunning) {
      return NextResponse.json({ status: 'running', promptId });
    }
    if (pendingIdx >= 0) {
      return NextResponse.json({ status: 'pending', promptId, position: pendingIdx + 1 });
    }

    // Not in queue, not in history → either unknown id or job failed/dropped
    const meta = jobs.get(promptId);
    if (meta && Date.now() - meta.startedAt < 20_000) {
      // Grace window for propagation right after POST
      return NextResponse.json({ status: 'pending', promptId });
    }
    releaseIp(promptId);
    jobs.delete(promptId);
    return NextResponse.json(
      { status: 'error', error: 'Job not found (may have failed or expired). You can generate a new image.' },
      { status: 404 },
    );
  } catch (err) {
    console.error('Image status error:', err);
    return NextResponse.json({ status: 'error', error: 'Internal error' }, { status: 500 });
  }
}
