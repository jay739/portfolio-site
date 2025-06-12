import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf';
import { rateLimit } from '@/lib/rate-limit';
import { handleAPIError, Errors } from '@/lib/error-handling';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    try {
      await limiter.check(10, 'AI_NEWS'); // 10 requests per minute
    } catch {
      throw Errors.TooManyRequests();
    }

    if (!NEWS_API_KEY) {
      throw Errors.Internal('News API key not configured');
    }

    const response = await fetch(
      `${NEWS_API_URL}?` + new URLSearchParams({
        q: '(AI OR "artificial intelligence" OR "machine learning") AND (technology OR software OR development)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '5',
        apiKey: NEWS_API_KEY
      })
    );

    if (!response.ok) {
      throw Errors.Internal(`News API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the articles to a simpler format
    const articles = data.articles.map((article: any) => ({
      title: article.title,
      summary: article.description || article.title,
      url: article.url
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF validation for POST requests
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateCsrfToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Rate limiting
    try {
      await limiter.check(5, 'AI_NEWS_POST'); // 5 POST requests per minute
    } catch {
      throw Errors.TooManyRequests();
    }

    // Handle POST-specific logic here
    const data = await request.json();
    
    return NextResponse.json({ 
      success: true,
      message: 'News preferences updated'
    });
  } catch (error) {
    return handleAPIError(error);
  }
} 