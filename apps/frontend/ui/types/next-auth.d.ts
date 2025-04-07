import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: string;
    organizationId: number;
    // Add other custom properties here
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      organizationId: number;
      // Include other properties from the default Session
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    organizationId: number;
  }
} 