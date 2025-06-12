export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: {
    source: string;
    type: 'resume' | 'project' | 'blog' | 'code' | 'other' | 'profile' | 'personality';
    date?: string;
    tags?: string[];
  };
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    userAgent?: string;
    ip?: string;
    sessionId?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    context?: string[];
    tokens?: number;
    model?: string;
  };
}

export interface SearchResult {
  document: Document;
  score: number;
  highlights?: string[];
}

export interface RAGConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  contextWindow: number;
  ollamaEndpoint: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  eval_count?: number;
} 