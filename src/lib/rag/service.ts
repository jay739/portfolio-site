import { Document, Conversation, Message, SearchResult, RAGConfig } from './types';
import { Intent, HybridWeights, docPrefixesForIntent, INTENT_CONFIG } from './intents';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Message schema validation
const messageSchema = z.string().min(1).max(2000);

// In-memory storage for conversations and rate limiting
const conversations = new Map<string, Conversation>();
const rateLimits = new Map<string, { count: number, resetTime: number }>();

// Default RAG configuration
const defaultConfig: RAGConfig = {
  model: 'phi3:mini', // Faster default for CPU deployments
  temperature: 0.2,
  maxTokens: 512,
  topK: 30,
  topP: 0.9,
  contextWindow: 2048,
  ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
};

// Simple in-memory rate limiter
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new rate limit
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + 10000 // 10 seconds window
    });
    return true;
  }

  if (limit.count >= 10) { // 10 requests per 10 seconds
    return false;
  }

  limit.count++;
  return true;
}

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] || 0), 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

// Zod schema for input validation
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

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'at',
  'by', 'is', 'are', 'was', 'were', 'be', 'been', 'can', 'could', 'should',
  'would', 'do', 'does', 'did', 'what', 'which', 'who', 'whom', 'where', 'when',
  'why', 'how', 'about', 'from', 'that', 'this', 'it', 'as', 'if', 'i', 'you',
  'we', 'they', 'he', 'she', 'my', 'your', 'our', 'their', 'hi', 'hello', 'hey'
]);

export class RAGService {
  private config: RAGConfig;
  private documents: Document[] = [];
  private readyPromise: Promise<void>;

  constructor(config: Partial<RAGConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.readyPromise = this.loadDocuments();
  }

  private async ensureReady() {
    await this.readyPromise;
  }

  private async loadDocuments() {
    try {
      const documentsPath = path.join(process.cwd(), 'src', 'rag', 'documents');
      const files = await fs.readdir(documentsPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(documentsPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const document = JSON.parse(content);
          // Exclude generic personality prompt dumps from retrieval context.
          // These can contaminate answers for impact/experience questions.
          if (
            typeof document?.id === 'string' &&
            document.id.toLowerCase().includes('gpt_personality')
          ) {
            continue;
          }
          this.documents.push(document);
        }
      }
      
      console.log(`Loaded ${this.documents.length} documents from ${documentsPath}`);
      
      // Log loaded document titles for debugging
      this.documents.forEach(doc => {
        console.log(`- ${doc.title || doc.id}: ${doc.content.length} chars`);
      });
    } catch (error) {
      console.error('Error loading documents:', error);
      throw error; // We want to know if document loading fails
    }
  }

  public async searchDocuments(query: string): Promise<SearchResult[]> {
    await this.ensureReady();
    // Lightweight keyword matching with basic noise filtering.
    const results: SearchResult[] = [];
    const queryTerms = query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));

    if (queryTerms.length === 0) {
      return [];
    }
    
    const queryLower = query.toLowerCase();

    for (const doc of this.documents) {
      const title = (doc.title || '').toLowerCase();
      const id = (doc.id || '').toLowerCase();
      const tags = Array.isArray(doc.metadata?.tags) ? doc.metadata.tags.join(' ').toLowerCase() : '';
      const content = doc.content.toLowerCase();
      const haystack = `${title}\n${id}\n${tags}\n${content}`;
      const matches = queryTerms.filter(term => haystack.includes(term));
      if (matches.length > 0) {
        let bonus = 0;
        const wantsStar = /(\bstar\b|situation|task|action|result|incident|debug|architecture|decision)/i.test(queryLower);
        const wantsIncident = /(incident|debug)/i.test(queryLower);
        const wantsArchitecture = /(architecture|decision|tradeoff|retrieval)/i.test(queryLower);

        if (wantsStar && id.includes('chip_star_')) bonus += 0.2;
        if (wantsIncident && id.includes('chip_star_incident_')) bonus += 0.2;
        if (wantsArchitecture && id.includes('chip_star_arch_')) bonus += 0.2;

        results.push({
          document: doc,
          score: Math.min(1, matches.length / queryTerms.length + bonus)
        });
      }
    }
    
    const searchResults = results.sort((a, b) => b.score - a.score).slice(0, 5);

    // Log search for transparency
    console.log(`RAG Search - Query: "${query}", Found ${searchResults.length} documents, Scores: ${searchResults.map(r => r.score.toFixed(2)).join(', ')}`);

    return searchResults;
  }

  /**
   * Hybrid retrieval — the scoring formula is:
   *
   *   score = alpha * semanticScore + beta * keywordScore + gamma * metadataPrior
   *
   * Phase 1: alpha=0 (semanticScore always 0). Only keyword + metadata prior active.
   * Phase 2: implement getSemanticScore() with nomic-embed-text embeddings via Ollama.
   *          Flip alpha in INTENT_CONFIG per intent. No other code changes needed.
   *
   * FallbackPolicy.allowSupplemental controls whether general-profile docs are
   * included as supplemental context (gamma receives a smaller prior for them).
   */
  public async searchByIntent(query: string, intent: Intent): Promise<SearchResult[]> {
    await this.ensureReady();

    const config = INTENT_CONFIG[intent];
    const weights: HybridWeights = config.hybridWeights;
    const { primary: primaryPrefixes, supplemental: supplementalPrefixes } = docPrefixesForIntent(intent);

    const queryTerms = query
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));

    const queryLower = query.toLowerCase();

    // STAR sub-intent signals for additional metadata priors
    const wantsStar        = /(\bstar\b|situation|task|action|result|incident|debug|architecture|decision)/i.test(queryLower);
    const wantsIncident    = /(incident|debug)/i.test(queryLower);
    const wantsArchitecture = /(architecture|decision|tradeoff|retrieval)/i.test(queryLower);

    // Phase 2 hook: returns cosine similarity between query embedding and doc embedding.
    // Currently returns 0 (no embeddings pre-computed). When Phase 2 lands:
    //   1. Pre-compute doc embeddings via nomic-embed-text and cache them.
    //   2. Compute query embedding once per request.
    //   3. Return cosine(queryEmbedding, docEmbedding) here.
    const getSemanticScore = (_docId: string): number => 0;

    const results: SearchResult[] = [];

    for (const doc of this.documents) {
      const id      = (doc.id    || '').toLowerCase();
      const title   = (doc.title || '').toLowerCase();
      const tags    = Array.isArray(doc.metadata?.tags) ? doc.metadata.tags.join(' ').toLowerCase() : '';
      const content = doc.content.toLowerCase();
      const haystack = `${title}\n${id}\n${tags}\n${content}`;

      // ── gamma: metadata prior ────────────────────────────────────────────
      let metadataPrior = 0;
      const isPrimary      = primaryPrefixes.some((p) => id.startsWith(p));
      const isSupplemental = !isPrimary && supplementalPrefixes.some((p) => id.startsWith(p));
      if (isPrimary)      metadataPrior = 1.0;          // full prior for intent-aligned docs
      else if (isSupplemental) metadataPrior = 0.20;    // weak prior for supplemental docs

      // STAR sub-intent bonuses layered on top of metadata prior
      if (wantsStar        && id.includes('chip_star_'))          metadataPrior = Math.min(1, metadataPrior + 0.30);
      if (wantsIncident    && id.includes('chip_star_incident_')) metadataPrior = Math.min(1, metadataPrior + 0.30);
      if (wantsArchitecture && id.includes('chip_star_arch_'))    metadataPrior = Math.min(1, metadataPrior + 0.30);

      // Skip docs with no alignment at all (no keyword, no prior)
      if (metadataPrior === 0 && queryTerms.length === 0) continue;

      // ── beta: keyword score ──────────────────────────────────────────────
      const matchCount  = queryTerms.length > 0
        ? queryTerms.filter((term) => haystack.includes(term)).length
        : 0;
      const keywordScore = queryTerms.length > 0 ? matchCount / queryTerms.length : 0;

      // Skip docs with zero signal on both keyword and metadata
      if (keywordScore === 0 && metadataPrior === 0) continue;

      // ── alpha: semantic score (Phase 2) ───────────────────────────────────
      const semanticScore = getSemanticScore(id);

      // ── Hybrid formula ────────────────────────────────────────────────────
      const hybrid = Math.min(
        1,
        weights.alpha * semanticScore +
        weights.beta  * keywordScore  +
        weights.gamma * metadataPrior
      );

      if (hybrid >= config.minScore || metadataPrior >= 0.5) {
        results.push({ document: doc, score: hybrid });
      }
    }

    const topK   = config.topK > 0 ? config.topK : 5;
    const sorted = results.sort((a, b) => b.score - a.score).slice(0, topK);

    console.log(
      `RAG Hybrid[${intent}] - "${query.slice(0, 60)}", docs=${sorted.length}, scores=${sorted.map((r) => r.score.toFixed(2)).join(', ')}`
    );
    return sorted;
  }

  private calculateSimilarity(embedding: number[], text: string): number {
    // Implement proper vector similarity calculation
    // For now, return a simple score based on keyword matching
    const keywords = text.toLowerCase().split(/\W+/);
    const queryKeywords = embedding.map(e => e.toString()).join(' ').toLowerCase().split(/\W+/);
    const matches = queryKeywords.filter(k => keywords.includes(k)).length;
    return matches / Math.max(keywords.length, queryKeywords.length);
  }

  private extractHighlights(text: string, query: string): string[] {
    const highlights: string[] = [];
    const sentences = text.split(/[.!?]+/);
    const keywords = query.toLowerCase().split(/\W+/);

    sentences.forEach(sentence => {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        highlights.push(sentence.trim());
      }
    });

    return highlights.slice(0, 3);
  }

  private async generateResponse(
    message: string,
    context: SearchResult[],
    conversation: Conversation
  ): Promise<string> {
    const contextText = context
      .map(result => result.document.content)
      .join('\n\n');

    const prompt = `Based on this context about Jayakrishna Konda, answer the question:

Context: ${contextText || 'No information found.'}

Question: ${message}
Answer:`;

    try {
      // Use focused parameters for RAG generation
      const response = await fetch(this.config.ollamaEndpoint + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_k: this.config.topK,
            top_p: this.config.topP,
            num_ctx: this.config.contextWindow
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse Ollama response as JSON:', responseText);
        throw new Error('Invalid response from Ollama API');
      }
      
      const generatedResponse = data.response || 'I apologize, but I was unable to generate a response.';
      
      // Post-process response to ensure RAG compliance
      return this.validateRAGResponse(generatedResponse, contextText);
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async handleMessage(
    message: string,
    sessionId: string,
    metadata: { userAgent?: string; ip?: string }
  ): Promise<{ reply: string; conversationId: string }> {
    try {
      await this.ensureReady();
      messageSchema.parse(message); // Validate input
      
      // Rate limiting
      const identifier = metadata.ip || sessionId;
      if (!checkRateLimit(identifier)) {
        throw new Error('Rate limit exceeded. Please try again in a few seconds.');
      }

      // Get or create conversation
      let conversation = conversations.get(sessionId);
      if (!conversation) {
        conversation = {
          id: sessionId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { ...metadata, sessionId },
        };
        conversations.set(sessionId, conversation);
      }

      // Add user message
      const userMessage: Message = {
        id: nanoid(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      conversation.messages.push(userMessage);

      // Search for relevant context
      const context = await this.searchDocuments(message);

      // Generate response
      const reply = await this.generateResponse(message, context, conversation);

      // Add assistant message
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        metadata: {
          context: context.map(result => result.document.content),
          model: this.config.model,
        },
      };
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = new Date();

      // Clean up old conversations periodically
      this.cleanupOldConversations();

      return { reply, conversationId: conversation.id };
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  private cleanupOldConversations() {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour in milliseconds
    
    for (const [sessionId, conversation] of conversations.entries()) {
      if (conversation.updatedAt.getTime() < oneHourAgo) {
        conversations.delete(sessionId);
      }
    }
  }

  private validateRAGResponse(response: string, contextText: string): string {
    // Red flags that indicate potential hallucination
    const hallucinationIndicators = [
      'based on my knowledge',
      'i know that',
      'it\'s common that',
      'typically',
      'usually',
      'in general',
      'most people',
      'according to',
      'research shows',
      'studies indicate'
    ];

    const lowerResponse = response.toLowerCase();
    
    // Check for hallucination indicators
    const hasHallucinationIndicators = hallucinationIndicators.some(indicator => 
      lowerResponse.includes(indicator)
    );

    if (hasHallucinationIndicators) {
      console.warn('RAG Response Validation: Potential hallucination detected, filtering response');
      return "I don't have that specific information in my knowledge base. You can find more details in Jayakrishna's complete documents or contact him directly.";
    }

    // If context is empty but response is detailed, it's likely hallucination
    if ((!contextText || contextText.trim().length < 50) && response.length > 100) {
      console.warn('RAG Response Validation: Detailed response without sufficient context, filtering');
      return "I don't have that specific information in my knowledge base. You can find more details in Jayakrishna's complete documents or contact him directly.";
    }

    return response;
  }

  public async getConversation(sessionId: string): Promise<Conversation | null> {
    return conversations.get(sessionId) || null;
  }
} 