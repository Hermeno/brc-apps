import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: {
              id: true, email: true, name: true, role: true,
              password: true, suspendedUntil: true, isVerified: true,
              loginAttempts: true, loginLockedUntil: true, deletedAt: true,
            },
          });

          if (!user || !user.password) return null;

          // Soft-deleted account
          if (user.deletedAt) return null;

          // Account locked after too many failed attempts
          if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
            throw new Error('ACCOUNT_LOCKED');
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            const newAttempts = user.loginAttempts + 1;
            const shouldLock  = newAttempts >= MAX_ATTEMPTS;
            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts:    newAttempts,
                loginLockedUntil: shouldLock
                  ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
                  : undefined,
              },
            });
            if (shouldLock) throw new Error('ACCOUNT_LOCKED');
            return null;
          }

          // Successful login — reset counter
          await prisma.user.update({
            where: { id: user.id },
            data:  { loginAttempts: 0, loginLockedUntil: null },
          });

          if (!user.isVerified) throw new Error('EMAIL_NOT_VERIFIED');

          if (user.suspendedUntil && user.suspendedUntil > new Date()) {
            throw new Error('ACCOUNT_SUSPENDED');
          }

          return { id: user.id, email: user.email, name: user.name, role: user.role };

        } catch (err: any) {
          if (
            err.message === 'EMAIL_NOT_VERIFIED' ||
            err.message === 'ACCOUNT_SUSPENDED' ||
            err.message === 'ACCOUNT_LOCKED'
          ) throw err;
          console.error('[auth] authorize error:', err?.message ?? err);
          return null;
        }
      }
    })
  ],
});
