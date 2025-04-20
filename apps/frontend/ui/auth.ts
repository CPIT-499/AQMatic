// Remove nodejs runtime declaration - we'll use Edge compatible auth
// import NextAuth from "next-auth"
import NextAuth from "next-auth"  // Use standard import since next-auth has Edge support built-in
import CredentialsProvider from "next-auth/providers/credentials"
// Remove PostgresAdapter import as it uses Node.js features
// import PostgresAdapter from "@auth/pg-adapter"
// import { Pool, PoolClient } from "pg"
// You need to install bcrypt: pnpm add bcrypt @types/bcrypt -w
// import bcrypt from "bcrypt"

// Define custom types to extend next-auth types
declare module "next-auth" {
  interface User {
    role: string;
    organizationId: number;
    accessToken: string;
    username: string; // Add username field to match backend response
  }
  
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      organizationId: number;
      username: string; 
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    organizationId: number;
    accessToken: string;
    username: string;
  }
}

// Define backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" }, // Use JWT strategy for credentials provider
  secret: process.env.NEXTAUTH_SECRET || "your-development-only-secret-key-change-in-production",
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
          // Call the backend API directly instead of through an internal API route
          const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          if (!res.ok) {
            console.error("Login failed:", res.status, res.statusText);
            return null;
          }
          
          const userData = await res.json();
          
          // Map the API response to the expected user format
          // Fields based on backend's LoginResponse model
          const user = {
            id: userData.user_id.toString(),
            email: userData.email,
            name: userData.name || userData.username, // Use name if available, otherwise username
            username: userData.username,
            role: userData.role || "user", // Default to "user" if role is not provided
            organizationId: userData.organization_id,
            // Store access token for future API requests (named access_token in backend)
            accessToken: userData.access_token
          };
          
          // Log the organization ID to verify it's correct
          console.log("Authenticated with organization ID:", user.organizationId);
          
          return user;
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
        token.id = user.id as string;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.role = user.role;
        token.organizationId = user.organizationId;
        // Store access token in the JWT
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as number;
        // Add access token to the session for client-side API calls
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  }
});

// Add this to make auth available for middleware
export default auth;