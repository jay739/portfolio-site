import { Document, Conversation, Message, SearchResult, RAGConfig } from './types';
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
  model: 'rag-mistral',
  temperature: 0.7,
  maxTokens: 2048,
  topK: 50,
  topP: 0.9,
  contextWindow: 8192,
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

export class RAGService {
  private config: RAGConfig;
  private documents: Document[] = [];

  constructor(config: Partial<RAGConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.loadDocuments();
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
    // Simple keyword matching for now
    const results: SearchResult[] = [];
    const queryTerms = query.toLowerCase().split(' ');
    
    for (const doc of this.documents) {
      const content = doc.content.toLowerCase();
      const matches = queryTerms.filter(term => content.includes(term));
      if (matches.length > 0) {
        results.push({
          document: doc,
          score: matches.length / queryTerms.length
        });
      }
    }
    
    return results.sort((a, b) => b.score - a.score).slice(0, 3);
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

    const prompt = `You are an AI assistant representing Jayakrishna Konda. Use the following context to answer questions about Jayakrishna's background, skills, projects, and experience. If you don't find relevant information in the context, say so.

Context:
${contextText}

Chat History:
${conversation.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User: ${message}
Assistant:`;

    try {
      const response = await fetch(this.config.ollamaEndpoint + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_k: this.config.topK,
          top_p: this.config.topP,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      return data.response || 'I apologize, but I was unable to generate a response.';
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

  public async getConversation(sessionId: string): Promise<Conversation | null> {
    return conversations.get(sessionId) || null;
  }
} 