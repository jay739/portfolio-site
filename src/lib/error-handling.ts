import { NextResponse } from 'next/server';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isPublic: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.isPublic ? error.message : 'An error occurred',
        code: error.statusCode
      },
      { 
        status: error.statusCode,
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
      code: 500
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
  BadRequest: (message: string, isPublic = true) => 
    new APIError(message, 400, isPublic),
  
  Unauthorized: (message = 'Unauthorized', isPublic = true) => 
    new APIError(message, 401, isPublic),
  
  Forbidden: (message = 'Forbidden', isPublic = true) => 
    new APIError(message, 403, isPublic),
  
  NotFound: (message = 'Not found', isPublic = true) => 
    new APIError(message, 404, isPublic),
  
  TooManyRequests: (message = 'Too many requests', isPublic = true) => 
    new APIError(message, 429, isPublic),
  
  Internal: (message = 'Internal server error', isPublic = false) => 
    new APIError(message, 500, isPublic),
}; 