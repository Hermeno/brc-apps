import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  logger: {
    error: (err: any) => {
      const msg = err?.message ?? String(err);
      if (msg === 'CredentialsSignin' || err?.name === 'CredentialsSignin') return;
      console.error('[auth]', msg);
    },
    warn:  (code: string) => console.warn('[auth:warn]', code),
    debug: () => {},
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  providers: [],
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
