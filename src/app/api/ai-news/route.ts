import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf';
import { handleAPIError, Errors } from '@/lib/error-handling';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export async function GET(request: NextRequest) {
  try {
    if (!NEWS_API_KEY) {
      console.error('News API key not configured');
      throw Errors.Internal('News API key not configured');
    }

    const response = await fetch(
      `${NEWS_API_URL}?` + new URLSearchParams({
        q: '(AI OR "artificial intelligence" OR "machine learning") AND (technology OR software OR development)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '5',
        apiKey: NEWS_API_KEY
      }),
      {
        headers: {
          'User-Agent': 'jay739-portfolio/1.0'
        }
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
    
    // Transform the articles to a simpler format
    const articles = data.articles.map((article: any) => ({
      title: article.title,
      summary: article.description || article.title,
      url: article.url
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('AI News API error:', error);
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