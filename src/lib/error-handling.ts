import { NextResponse } from 'next/server';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.code,
        code: error.code
      },
      { 
        status: error.status,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  
  // Log internal errors but don't expose them
  console.error('Internal error:', error);
  
  return NextResponse.json(
    { 
      error: 'An internal error occurred',
      code: 'INTERNAL_SERVER_ERROR'
    },
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

// Common error types
export const Errors = {
  BadRequest: (message = 'Bad Request') => new APIError(message, 400, 'BAD_REQUEST'),
  Unauthorized: (message = 'Unauthorized') => new APIError(message, 401, 'UNAUTHORIZED'),
  Forbidden: (message = 'Forbidden') => new APIError(message, 403, 'FORBIDDEN'),
  NotFound: (message = 'Not Found') => new APIError(message, 404, 'NOT_FOUND'),
  TooManyRequests: (message = 'Too Many Requests') => new APIError(message, 429, 'TOO_MANY_REQUESTS'),
  Internal: (message = 'Internal Server Error') => new APIError(message, 500, 'INTERNAL_SERVER_ERROR'),
}; 