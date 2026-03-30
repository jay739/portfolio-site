import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag/service';
import { headers } from 'next/headers';

// Initialize RAG service
const ragService = new RAGService();

const GREETING_REGEX = /^(hi|hello|hey|yo|hola|namaste)[!. ]*$/i;
const MAX_CONTEXT_DOCS = 2;
const MAX_CONTEXT_CHARS_PER_DOC = 1800;
const MIN_IN_SCOPE_CONTEXT_CHARS = 60;
const MIN_RELEVANCE_SCORE = 0.12;
const OOS_PREFIX =
  'I am confined to answer details about Jayakrishna; such questions are out of my scope of answering.';
const QUERY_STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'at',
  'by', 'is', 'are', 'was', 'were', 'be', 'been', 'can', 'could', 'should',
  'would', 'do', 'does', 'did', 'what', 'which', 'who', 'whom', 'where', 'when',
  'why', 'how', 'about', 'from', 'that', 'this', 'it', 'as', 'if', 'i', 'you',
  'we', 'they', 'he', 'she', 'my', 'your', 'our', 'their', 'hi', 'hello', 'hey'
]);

function buildGoogleSearchLink(query: string): string {
  const base = 'https://www.google.com/search?q=';
  return `${base}${encodeURIComponent(query.trim())}`;
}

function outOfScopeReply(query: string): string {
  return `${OOS_PREFIX} But here's the Google search results of what you asked for:\n${buildGoogleSearchLink(query)}`;
}

function buildContextText(rawContext: string[]): string {
  return rawContext
    .slice(0, MAX_CONTEXT_DOCS)
    .map((content) => content.replace(/\s+/g, ' ').trim().slice(0, MAX_CONTEXT_CHARS_PER_DOC))
    .join('\n\n');
}

function extractiveAnswer(query: string, contextText: string): string | null {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 3 && !QUERY_STOP_WORDS.has(term));

  if (terms.length === 0) return null;

  const sentences = contextText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 35 && s.length <= 260);

  if (sentences.length === 0) return null;

  const ranked = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase();
      const score = terms.reduce((acc, term) => (lower.includes(term) ? acc + 1 : acc), 0);
      return { sentence, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (ranked.length === 0) return null;
  return ranked.map((item) => item.sentence).join(' ');
}

function contextualFallbackAnswer(query: string, contextText: string): string {
  const extractive = extractiveAnswer(query, contextText);
  if (extractive) return extractive;

  const sentences = contextText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 45 && s.length <= 240)
    .slice(0, 2);

  if (sentences.length > 0) {
    return sentences.join(' ');
  }

  return outOfScopeReply(query);
}

function isLikelyProfileScopedQuery(query: string): boolean {
  return /(jayakrishna|konda|profile|resume|experience|project|skills|impact|timeline|career|milestones|outcomes|metrics|genai|nlp|devops|homeserver|ai tools|blog)/i.test(
    query
  );
}

function enrichQueryForRetrieval(query: string): string {
  const lower = query.toLowerCase();
  const additions: string[] = ['Jayakrishna Konda profile resume projects skills experience'];

  if (/(journey|timeline|milestone|transition|narrative)/i.test(lower)) {
    additions.push('career timeline role progression infosys cognizant r/seek umbc enigma technologies');
  }
  if (/(impact|outcome|metric|signal|performance)/i.test(lower)) {
    additions.push('measurable outcomes delivery impact engineering velocity production metrics');
  }
  if (/(nlp|genai|llm|ai|ml|rag|tool)/i.test(lower)) {
    additions.push('ai ml nlp genai rag systems deployment model workflows');
  }
  if (/(home|server|infra|ops|devops|monitor|telemetry)/i.test(lower)) {
    additions.push('homeserver infrastructure devops monitoring containerized services reliability');
  }

  return `${query} ${additions.join(' ')}`.trim();
}

async function searchWithExpansion(message: string) {
  const queries = Array.from(new Set([message, enrichQueryForRetrieval(message)]));
  let bestContext: Awaited<ReturnType<RAGService['searchDocuments']>> = [];

  for (const q of queries) {
    const context = await ragService.searchDocuments(q);
    const bestScore = context[0]?.score ?? 0;
    if (bestScore > (bestContext[0]?.score ?? 0)) {
      bestContext = context;
    }
  }

  return bestContext;
}

export async function POST(req: NextRequest) {

  try {
    // Get request metadata
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';

    // Get session ID from cookie or generate new one
    const sessionId = req.cookies.get('chat_session')?.value || 
                     crypto.randomUUID();

    // Parse request body
    const { message, stream } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    if (GREETING_REGEX.test(message.trim())) {
      return NextResponse.json(
        {
          reply:
            "Hi! I can answer only questions about Jayakrishna Konda's profile, resume, projects, skills, and related documents.",
          conversationId: sessionId,
        },
        { status: 200 }
      );
    }

    // Search for relevant context
    const context = await searchWithExpansion(message);
    const contextText = buildContextText(context.map(result => result.document.content));
    const bestScore = context[0]?.score ?? 0;
    const likelyInScope = isLikelyProfileScopedQuery(message);

    if (process.env.NODE_ENV !== 'production') {
      // Keep detailed debug logging only in development.
      console.log(`DEBUG: Query="${message}", Context found: ${contextText.substring(0, 200)}...`);
      console.log(`DEBUG: Context length: ${contextText.length}, Number of documents: ${context.length}`);
    }

    // Keep strict scope for unrelated queries, but be less strict for chip-like in-scope prompts.
    const hasEnoughContext = contextText && contextText.trim().length >= MIN_IN_SCOPE_CONTEXT_CHARS;
    const hasGoodScore = bestScore >= MIN_RELEVANCE_SCORE;
    if (!hasEnoughContext || (!hasGoodScore && !likelyInScope)) {
      return NextResponse.json({ 
        reply: outOfScopeReply(message),
        conversationId: sessionId
      }, { status: 200 });
    }

    const prompt = `STRICT INSTRUCTIONS:
- You are a profile assistant for Jayakrishna Konda only.
- You MUST ONLY use information from the DOCUMENT below.
- NEVER suggest external websites, sources, references, or general web resources.
- NEVER mention where the answer came from.
- NEVER use phrases like "the profile states", "the document says", "according to the resume", or "the source mentions".
- If the question cannot be answered from the document, answer exactly:
"I am confined to answer details about Jayakrishna; such questions are out of my scope of answering."

===== DOCUMENT START =====
${contextText}
===== DOCUMENT END =====

QUESTION: ${message}

RESPONSE (using ONLY the document above):`;

    const fastReply = extractiveAnswer(message, contextText);
    if (fastReply) {
      return NextResponse.json({ reply: fastReply, conversationId: sessionId }, { status: 200 });
    }

    // If streaming is requested (default: true)
    if (stream !== false) {
      let ollamaRes: Response;
      try {
        ollamaRes = await fetch(`${process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'phi3:mini',
            prompt,
            stream: true,
            keep_alive: '15m',
            options: {
              temperature: 0.2,
              num_ctx: 1024,
              num_predict: 120,
              top_k: 30,
              top_p: 0.9
            }
          }),
        });
      } catch (ollamaError) {
        return NextResponse.json(
          {
            reply: contextualFallbackAnswer(message, contextText),
            conversationId: sessionId,
          },
          { status: 200 }
        );
      }

      if (!ollamaRes.ok) {
        return NextResponse.json(
          {
            reply: contextualFallbackAnswer(message, contextText),
            conversationId: sessionId,
          },
          { status: 200 }
        );
      }

      if (!ollamaRes.body) {
        return NextResponse.json(
          {
            reply: contextualFallbackAnswer(message, contextText),
            conversationId: sessionId,
          },
          { status: 200 }
        );
      }

      // Pipe Ollama's stream to the client
      return new Response(ollamaRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Fallback: non-streaming (legacy)
    const { reply, conversationId } = await ragService.handleMessage(
      message,
      sessionId,
      { userAgent, ip }
    );
    const response = NextResponse.json({ reply, conversationId });
    response.cookies.set('chat_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
    });
    return response;
  } catch (error) {
    console.error('Chatbot API error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint to retrieve conversation history
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('chat_session')?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No active conversation' },
        { status: 404 }
      );
    }

    const conversation = await ragService.getConversation(sessionId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 