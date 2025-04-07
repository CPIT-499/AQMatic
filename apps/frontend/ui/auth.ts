// Remove nodejs runtime declaration - we'll use Edge compatible auth
// import NextAuth from "next-auth"
import NextAuth from "next-auth"  // Use standard import since next-auth has Edge support built-in
import CredentialsProvider from "next-auth/providers/credentials"
// Remove PostgresAdapter import as it uses Node.js features
// import PostgresAdapter from "@auth/pg-adapter"
// import { Pool, PoolClient } from "pg"
// You need to install bcrypt: pnpm add bcrypt @types/bcrypt -w
// import bcrypt from "bcrypt"

// Remove direct database access which uses Node.js features
// const pool = new Pool({...})
// async function getUserByEmail(email: string) {...}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // adapter: PostgresAdapter(pool), // Remove adapter that uses Node.js features
  session: { strategy: "jwt" }, // Use JWT strategy for credentials provider
  pages: {
    signIn: '/login', // Use custom login page
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Call our own API instead of directly accessing DB
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          const user = await res.json();
          
          if (res.ok && user) {
            return user;
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as number;
      }
      return session;
    }
  }
});

// Add this to make auth available for middleware
export default auth;