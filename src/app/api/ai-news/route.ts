import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf';
import { handleAPIError, Errors } from '@/lib/error-handling';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const newsLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });
const newsWriteLimiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 250 });

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    try {
      await newsLimiter.check(10, `news:${ip}`);
    } catch {
      throw Errors.TooManyRequests('Too many requests. Please wait before trying again.');
    }

    if (!NEWS_API_KEY) {
      console.error('News API key not configured');
      throw Errors.Internal('News API key not configured');
    }

    const response = await fetch(
      `${NEWS_API_URL}?` + new URLSearchParams({
        q: '"large language model" OR "generative AI" OR LLM OR "foundation model" OR "AI agent" OR RAG OR "OpenAI" OR "Anthropic" OR "machine learning"',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '15',
        apiKey: NEWS_API_KEY,
      }),
      {
        cache: 'no-store', // prevent Next.js from caching the upstream fetch
        headers: {
          'User-Agent': 'jay739-portfolio/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`News API responded with status: ${response.status}`);
      throw Errors.Internal(`News API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles) {
      console.error('Invalid response from News API:', data);
      throw Errors.Internal('Invalid response from News API');
    }
    
    // Transform articles — include image, source, and date for rich UI cards
    const articles = data.articles
      .filter((article: any) => article.title && article.url && !article.title.includes('[Removed]'))
      .map((article: any) => ({
        title: article.title,
        summary: article.description || '',
        url: article.url,
        image: article.urlToImage || null,
        publishedAt: article.publishedAt || null,
        source: article.source?.name || null,
      }));

    return NextResponse.json({ articles }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('AI News API error:', error);
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    try {
      await newsWriteLimiter.check(15, `news-write:${ip}`);
    } catch {
      throw Errors.TooManyRequests('Too many requests. Please wait before trying again.');
    }

    // CSRF validation for POST requests
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateCsrfToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Handle POST-specific logic here
    const data = await request.json();
    
    return NextResponse.json({ 
      success: true,
      message: 'News preferences updated'
    });
  } catch (error) {
    console.error('AI News POST error:', error);
    return handleAPIError(error);
  }
} 
