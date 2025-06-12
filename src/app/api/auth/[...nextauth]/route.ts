import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/lib/env';
import { Errors } from '@/lib/error-handling';

// API key validation
const validateApiKey = (apiKey: string) => {
  return apiKey === env.NETDATA_API_KEY;
};

export const authOptions = {
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
    strategy: 'jwt',
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
  secret: env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 