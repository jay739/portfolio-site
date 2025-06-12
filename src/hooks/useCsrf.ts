import { useState, useEffect } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Get the CSRF token from the cookie
    const getCsrfToken = () => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; csrfToken=`);
      if (parts.length === 2) {
        const token = parts.pop()?.split(';').shift();
        if (token) {
          setCsrfToken(token);
        }
      }
    };

    getCsrfToken();
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  };

  return { csrfToken, fetchWithCsrf };
} 