import { GetServerSideProps } from 'next';
import { getCsrfToken } from '@/lib/csrf';
import { useCsrf } from '@/hooks/useCsrf';
import { useState } from 'react';

export default function ExamplePage() {
  const { fetchWithCsrf } = useCsrf();
  const [result, setResult] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetchWithCsrf('/api/example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'example' }),
      });
      
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CSRF Protection Example</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test CSRF Protected Request
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Result: {result}</p>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Generate and set CSRF token
  const csrfToken = await getCsrfToken(context);
  
  return {
    props: {
      csrfToken,
    },
  };
}; 