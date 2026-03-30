import { useState, useEffect } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSRF token from API (sets cookie and returns token for header)
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch('/api/csrf', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.csrfToken) {
            setCsrfToken(data.csrfToken);
          }
        }
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    };

    fetchCsrfToken();
  }, []);

  // Helper function to make API requests with CSRF token
  const fetchWithCsrf = async (url: string, options: RequestInit = {}) => {
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }

    const headers = {
      ...options.headers,
      'x-csrf-token': csrfToken,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return response;
  };

  return { csrfToken, fetchWithCsrf };
} 