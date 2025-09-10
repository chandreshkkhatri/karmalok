import { compare } from "bcrypt-ts";
import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUserByEmail } from "@/db/queries";

import { authConfig } from "./auth.config";

interface ExtendedSession extends Session {
  user: User & {
    plan: 'basic' | 'pro' | 'enterprise';
  };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const user = await getUserByEmail(email);
        if (!user || Array.isArray(user)) return null;
        
        // Validate password if it exists (for non-bot users)
        if ('password' in user && user.password && !user.isBot) {
          const isValid = await compare(password, user.password as string);
          if (!isValid) return null;
        }
        
        return user as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan || 'basic';
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).plan = token.plan || 'basic';
      }

      return session as unknown as ExtendedSession;
    },
  },
});
