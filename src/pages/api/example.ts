import { NextApiRequest, NextApiResponse } from 'next';
import { csrfProtection } from '@/lib/csrf';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle POST request
    res.status(200).json({ message: 'Success!' });
  } else {
    // Handle other methods
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Wrap the handler with CSRF protection
export default csrfProtection(handler); 