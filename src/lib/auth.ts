import CredentialsProvider from 'next-auth/providers/credentials';
import { Errors } from '@/lib/error-handling';
import { AuthOptions } from 'next-auth';

// API key validation
const validateApiKey = (apiKey: string) => {
  const netdataApiKey = process.env.NETDATA_API_KEY;
  return netdataApiKey && apiKey === netdataApiKey;
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'API Key',
      credentials: {
        apiKey: { label: "API Key", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.apiKey) {
          throw Errors.Unauthorized('API key is required');
        }

        if (!validateApiKey(credentials.apiKey)) {
          throw Errors.Unauthorized('Invalid API key');
        }

        // Return a user object if authentication succeeds
        return {
          id: 'netdata-api',
          name: 'Netdata API Client',
          role: 'api-client'
        };
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 