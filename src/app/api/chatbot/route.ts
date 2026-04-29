import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag/service';
import { detectIntent, INTENT_CONFIG, docPrefixesForIntent, DOC_INTENT_TAGS } from '@/lib/rag/intents';
import { formatByIntent } from '@/lib/rag/formatters';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

// ─── Singleton ────────────────────────────────────────────────────────────────
const ragService = new RAGService();

const chatLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

// ─── Constants ────────────────────────────────────────────────────────────────
const GREETING_REGEX = /^(hi|hello|hey|yo|hola|namaste)[!. ]*$/i;
const MAX_CONTEXT_CHARS_PER_DOC = 1800;

// ─── Out-of-scope reply ───────────────────────────────────────────────────────

function outOfScopeReply(query: string): string {
  const OOS = 'I am confined to answer details about Jayakrishna; such questions are out of my scope of answering.';
  const link = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
  return `${OOS} But here's the Google search results of what you asked for:\n${link}`;
}

// ─── Scope gate ───────────────────────────────────────────────────────────────

function isLikelyInScope(query: string): boolean {
  const q = query.toLowerCase();
  const profileSignals =
    /(jayakrishna|konda|profile|resume|experience|project|skills|impact|timeline|career|milestones|outcomes|metrics|genai|nlp|devops|home.?server|homeserver|ai tools|blog|batcave|enigma|cognizant|infosys|umbc|r\/seek|self.host|docker|container|infrastructure|server setup|home.?lab|python|machine learning|deep learning|framework|cloud|aws|gcp|azure|education|university|degree|graduate|research|publication|paper|tool|model|deployment|pipeline|certification|\bai\b|\bml\b)/i.test(
      q
    );
  const leadershipSignals =
    /(roles?|responsibilit|technical leadership|leadership|mentoring|mentor|career progression|role progression|promotion|ownership)/i.test(
      q
    );
  const pronounReference = /\b(he|his|him)\b/i.test(q);
  const profileQuestionSignals =
    /(career|role|experience|project|portfolio|resume|skills|stack|deployment|production|batcave|timeline|education|impact|leadership|\bml\b|\bai\b|genai|rag|infra|infrastructure)/i.test(
      q
    );

  // Pronoun-only prompts like "Can he cook pasta?" should stay out-of-scope.
  const pronounScoped = pronounReference && profileQuestionSignals;

  return profileSignals || leadershipSignals || pronounScoped;
}

// ─── Context builder ──────────────────────────────────────────────────────────

function buildContextText(rawContent: string[], maxDocs: number): string {
  return rawContent
    .slice(0, maxDocs)
    .map((content) =>
      content
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
        .slice(0, MAX_CONTEXT_CHARS_PER_DOC)
    )
    .join('\n\n');
}

// ─── Query enrichment (intent-aware) ─────────────────────────────────────────
//
// Adds signal terms to improve keyword recall for each intent family.
// Does NOT affect semantic scoring (Phase 2) — embeddings use the raw query.

function enrichQuery(query: string, intent: string, chip?: string): string {
  const lower    = query.toLowerCase();
  const chipLower = (chip ?? '').toLowerCase();
  const base     = 'Jayakrishna Konda profile resume projects skills experience';

  const intentTerms: Record<string, string> = {
    career:          'career timeline role progression infosys cognizant r/seek umbc enigma technologies milestones transition',
    projects:        'STAR situation task action result project case study pipeline system built implemented production delivery',
    infra:           'homeserver infrastructure devops monitoring containerized services reliability batcave docker',
    skills:          'technical stack skills nlp ml genai rag tools python pytorch aws deployment expertise',
    'ai-research':   'ai ml nlp genai rag systems model workflows trends research lab vector embedding semantic',
    'ux-blog':       'interactive ux blog article guide longform accessibility read aloud chip prompt feedback',
    'general-profile': 'profile summary overview data scientist engineer',
  };

  const additions = [base, intentTerms[intent] ?? ''];

  // Sub-intent enrichment for projects
  if (intent === 'projects') {
    if (chipLower.includes('incident') || /(incident|debug)/i.test(lower))
      additions.push('incident debugging root cause mitigation fallback validation latency cost spike');
    if (chipLower.includes('architecture') || /(architecture|decision|tradeoff)/i.test(lower))
      additions.push('architecture decision tradeoff hybrid retrieval multistage pipeline model routing');
  }

  // General-profile sub-intent enrichment
  if (intent === 'general-profile') {
    if (/(education|university|degree|graduate|gpa)/i.test(lower))
      additions.push('UMBC university masters data science degree graduate GPA coursework academic');
    if (/(cloud|aws|gcp|azure)/i.test(lower))
      additions.push('AWS cloud platform deployment kubernetes docker production pipeline');
    if (/(compan|employer|work.?at|worked.?at)/i.test(lower))
      additions.push('Infosys Cognizant Enigma UMBC R/SEEK career roles transitions');
  }

  return `${query} ${additions.filter(Boolean).join(' ')}`.trim();
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

async function retrieveContext(
  message: string,
  intent: string,
  chip?: string
): Promise<{ contextText: string; bestScore: number }> {
  const config  = INTENT_CONFIG[intent as keyof typeof INTENT_CONFIG] ?? INTENT_CONFIG['general-profile'];
  const enriched = enrichQuery(message, intent, chip);

  // Hybrid intent-aware search + broad keyword search in parallel.
  // Results are merged by doc-ID, keeping the highest score per document.
  const { primary: primaryPrefixes, supplemental: supplementalPrefixes } = docPrefixesForIntent(
    intent as Parameters<typeof ragService.searchByIntent>[1]
  );

  const [intentDocs, keywordDocs] = await Promise.all([
    ragService.searchByIntent(enriched, intent as Parameters<typeof ragService.searchByIntent>[1]),
    ragService.searchDocuments(enriched),
  ]);

  // When allowSupplemental is false, strip keyword docs whose ID prefix maps to
  // a different intent's primary set — prevents cross-intent bleed (e.g. homeserver
  // "signals" doc leaking into ai-research "trend signals" results).
  const allowSupplemental = config.fallback.allowSupplemental;
  const filteredKeywordDocs = allowSupplemental
    ? keywordDocs
    : keywordDocs.filter((item) => {
        const id = (item.document.id || '').toLowerCase();
        const isIntentAligned = primaryPrefixes.some((p) => id.startsWith(p));
        const isSupplemental  = supplementalPrefixes.some((p) => id.startsWith(p));
        // Also allow docs with no known intent mapping (not in DOC_INTENT_TAGS at all)
        const hasKnownIntent  = Object.keys(DOC_INTENT_TAGS).some((p) => id.startsWith(p.toLowerCase()));
        return isIntentAligned || isSupplemental || !hasKnownIntent;
      });

  const merged = new Map<string, (typeof intentDocs)[number]>();
  for (const item of [...intentDocs, ...filteredKeywordDocs]) {
    const id   = item.document.id || item.document.title;
    const prev = merged.get(id);
    if (!prev || item.score > prev.score) merged.set(id, item);
  }

  const sorted = Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, config.topK);

  const bestScore  = sorted[0]?.score ?? 0;
  const contextText = buildContextText(
    sorted.map((r) => r.document.content),
    config.topK
  );
  return { contextText, bestScore };
}

// ─── STAR query detection ─────────────────────────────────────────────────────

function isStarQuery(query: string, chip?: string): boolean {
  const c = (chip ?? '').toLowerCase();
  return (
    /(\bstar\b|situation|task|action|result|incident|debugging|architecture decision|tradeoff)/i.test(query) ||
    c.includes('incident') ||
    c.includes('architecture')
  );
}

// ─── Ollama streaming ─────────────────────────────────────────────────────────

function buildOllamaPrompt(contextText: string, message: string): string {
  return `STRICT INSTRUCTIONS:
- You are a profile assistant for Jayakrishna Konda only.
- You MUST ONLY use information from the DOCUMENT below.
- NEVER suggest external websites, sources, or references.
- NEVER use phrases like "the profile states", "the document says", or "according to the resume".
- Prefer concrete specifics: technologies, systems, project names, quantities, and outcomes.
- Give 2-4 concise bullet points when enough detail exists.
- If the question cannot be answered from the document, answer exactly:
"I am confined to answer details about Jayakrishna; such questions are out of my scope of answering."

===== DOCUMENT START =====
${contextText}
===== DOCUMENT END =====

QUESTION: ${message}

RESPONSE (using ONLY the document above):`;
}

async function tryOllamaStream(prompt: string): Promise<Response | null> {
  const endpoint = process.env.OLLAMA_ENDPOINT ?? 'http://localhost:11434';
  const model    = process.env.OLLAMA_MODEL    ?? 'gemma2:2b';
  try {
    const res = await fetch(`${endpoint}/api/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: { temperature: 0.3, top_k: 30, top_p: 0.9, num_ctx: 2048, num_predict: 512 },
      }),
      signal: AbortSignal.timeout(parseInt(process.env.OLLAMA_TIMEOUT ?? '30000')),
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    try {
      await chatLimiter.check(10, `chat:${ip}`);
    } catch {
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
    }

    const sessionId   = req.cookies.get('chat_session')?.value || crypto.randomUUID();

    const { message, stream, clientContext } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const trimmed          = message.trim();
    const chipName         = typeof clientContext?.chip === 'string' ? clientContext.chip : undefined;
    const isIntroChipPrompt = clientContext?.source === 'intro-chip';

    // ── 1. Greeting shortcut ───────────────────────────────────────────────
    if (GREETING_REGEX.test(trimmed)) {
      return NextResponse.json(
        {
          reply: INTENT_CONFIG.greeting.fallback.message,
          conversationId: sessionId,
        },
        { status: 200 }
      );
    }

    // ── 2. Scope gate ──────────────────────────────────────────────────────
    if (!isIntroChipPrompt && !isLikelyInScope(trimmed)) {
      return NextResponse.json(
        { reply: outOfScopeReply(trimmed), conversationId: sessionId },
        { status: 200 }
      );
    }

    // ── 3. Intent detection ────────────────────────────────────────────────
    const intent = detectIntent(trimmed, chipName);
    const config = INTENT_CONFIG[intent];
    const starQuery = isStarQuery(trimmed, chipName);

    // ── 4. Retrieval ───────────────────────────────────────────────────────
    const { contextText, bestScore } = await retrieveContext(trimmed, intent, chipName);

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `DEBUG intent="${intent}" chip="${chipName}" score=${bestScore.toFixed(2)} ctx=${contextText.length}ch`
      );
    }

    // ── 5. Per-intent sufficiency check ───────────────────────────────────
    //
    // Each intent has its own minScore + minContextChars thresholds.
    // On failure: return the intent-specific fallback (no cross-intent spillover).
    const hasScore   = bestScore >= config.minScore;
    const hasContext = contextText.trim().length >= config.minContextChars;

    if (!hasScore && !hasContext && !isIntroChipPrompt) {
      return NextResponse.json(
        { reply: config.fallback.message, conversationId: sessionId },
        { status: 200 }
      );
    }

    // ── 6. Intent-driven formatted answer ─────────────────────────────────
    //
    // Chip prompts and structured intents always use the formatter.
    // Natural general-profile queries with good score may use Ollama streaming.
    const preferFormatter =
      isIntroChipPrompt ||
      intent !== 'general-profile' ||
      config.formatterPolicy !== 'extractive';

    if (preferFormatter) {
      const reply = formatByIntent(intent, contextText, trimmed, chipName, starQuery);
      return NextResponse.json({ reply, conversationId: sessionId }, { status: 200 });
    }

    // ── 7. Ollama streaming for general natural-language queries ───────────
    if (stream !== false && hasScore) {
      const prompt     = buildOllamaPrompt(contextText, trimmed);
      const ollamaRes  = await tryOllamaStream(prompt);

      if (ollamaRes?.body) {
        const encoder   = new TextEncoder();
        const ollamaBody = ollamaRes.body;
        const readable  = new ReadableStream({
          async start(controller) {
            const reader  = ollamaBody.getReader();
            const decoder = new TextDecoder();
            let buffer    = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                  if (!line.trim()) continue;
                  try {
                    const parsed = JSON.parse(line);
                    if (parsed.response)
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: parsed.response })}\n\n`));
                    if (parsed.done) {
                      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                      controller.close();
                      return;
                    }
                  } catch { /* skip malformed line */ }
                }
              }
            } catch {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            } finally {
              controller.close();
            }
          },
        });
        return new Response(readable, {
          headers: {
            'Content-Type':  'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection:      'keep-alive',
          },
        });
      }
    }

    // ── 8. Final fallback: formatter ───────────────────────────────────────
    const reply = formatByIntent(intent, contextText, trimmed, chipName, starQuery);
    return NextResponse.json({ reply, conversationId: sessionId }, { status: 200 });

  } catch (error) {
    console.error('Chatbot route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
