import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail } from "@/lib/domain/email";
import { resolveCallbackUrl } from "@/lib/auth/callback-url";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

/**
 * Auth.js v5 — Google + Resend magic link, database sessions (30d maxAge).
 * FR-001, FR-002, FR-004, FR-008; research R1–R4.
 *
 * allowDangerousEmailAccountLinking: same normalized email → one User across
 * providers (clarification #4). Only safe because Google/Resend verify email.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
      normalizeIdentifier(identifier) {
        return normalizeEmail(identifier);
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: THIRTY_DAYS,
  },
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        if (user.email) {
          session.user.email = normalizeEmail(user.email);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Relative same-app paths
      if (url.startsWith("/")) {
        const path = url.split("?")[0] ?? url;
        const search = url.includes("?") ? url.slice(url.indexOf("?")) : "";
        if (
          path === "/" ||
          path.startsWith("/sign-in") ||
          path.startsWith("/error") ||
          path.startsWith("/api/")
        ) {
          return `${baseUrl}${path}${search}`;
        }
        return `${baseUrl}${resolveCallbackUrl(path)}${search}`;
      }
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          if (
            target.pathname === "/" ||
            target.pathname.startsWith("/sign-in") ||
            target.pathname.startsWith("/error") ||
            target.pathname.startsWith("/api/")
          ) {
            return url;
          }
          return `${baseUrl}${resolveCallbackUrl(target.pathname)}${target.search}`;
        }
      } catch {
        /* fall through */
      }
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && user.id) {
        const email = normalizeEmail(user.email);
        if (email !== user.email) {
          await prisma.user.update({
            where: { id: user.id },
            data: { email },
          });
        }
      }
    },
  },
  trustHost: true,
});
