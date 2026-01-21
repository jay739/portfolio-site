import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag/service';
import { headers } from 'next/headers';

// Initialize RAG service
const ragService = new RAGService();

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

    // Search for relevant context
    const context = await ragService.searchDocuments(message);
    const contextText = context
      .map(result => result.document.content)
      .join('\n\n');

    // DEBUG: Log what context was found
    console.log(`DEBUG: Query="${message}", Context found: ${contextText.substring(0, 200)}...`);
    console.log(`DEBUG: Context length: ${contextText.length}, Number of documents: ${context.length}`);

    // If no relevant context found, return helpful message
    if (!contextText || contextText.trim().length < 50) {
      return NextResponse.json({ 
        reply: "I don't have enough information in my knowledge base to answer that question. Please check the provided documents or contact Jayakrishna directly.",
        conversationId: sessionId
      }, { status: 200 });
    }

    const prompt = `STRICT INSTRUCTIONS: You are a document reader. You MUST ONLY use information from the DOCUMENT below. Do NOT use any knowledge from your training. If the document doesn't contain the answer, say "This information is not available in the provided documents."

===== DOCUMENT START =====
${contextText}
===== DOCUMENT END =====

QUESTION: ${message}

RESPONSE (using ONLY the document above):`;

    // If streaming is requested (default: true)
    if (stream !== false) {
      const ollamaRes = await fetch(`${process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'phi3:3.8b',
          prompt,
          stream: true,
          temperature: 0.3, // Slightly lower temperature for more focused responses
        }),
      });

      if (!ollamaRes.ok) {
        return NextResponse.json({ error: 'Ollama API error' }, { status: ollamaRes.status });
      }

      if (!ollamaRes.body) {
        return NextResponse.json({ error: 'No stream from Ollama' }, { status: 500 });
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