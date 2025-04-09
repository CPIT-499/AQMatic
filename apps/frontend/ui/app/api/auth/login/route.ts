import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import CredentialsProvider from "next-auth/providers/credentials";

// Using Node.js runtime for this API route to access database directly
export const runtime = 'nodejs';

// Create DB connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the database connection at startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`Request body: ${JSON.stringify(body)}`);
    console.log(`Attempting login for email: ${email}`);

    // Get user from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT user_id, email, name, password_hash, organization_id, role FROM users WHERE email = $1',
        [email]
      );
      
      const user = result.rows[0];
      
      console.log(`DB query result: ${JSON.stringify(user)}`);

      // Check your database to confirm passwords are as expected
      const passwordCheckResult = await client.query(
        'SELECT username, password_hash FROM users WHERE email = $1',
        [email]
      );
      console.log(`Password check result: ${JSON.stringify(passwordCheckResult.rows)}`);

      // Check if user exists
      if (!user) {
        console.log(`No user found with email: ${email}`);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log(`User found: ${user.name}, ID: ${user.user_id}`);

      // Add more logging
      console.log(`Received login attempt with email: ${email}`);
      console.log(`Found user password_hash: ${user?.password_hash}`);
      console.log(`Comparing with submitted password: ${password}`);
      console.log(`Password comparison result: ${password === user?.password_hash}`);

      // Verify password
      // For testing, we're directly comparing password and password_hash
      // TODO: Use proper hashing in production
      // const isValidPassword = await bcrypt.compare(password, user.password_hash);
      const isValidPassword = password === user.password_hash;

      console.log(`Password comparison: ${password} === ${user?.password_hash}`);
      
      if (!isValidPassword) {
        console.log(`Invalid password for user: ${email}`);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log(`Successful login for user: ${email}`);

      // Return user data (excluding sensitive information)
      return NextResponse.json({
        id: user.user_id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Add this to your authorize function temporarily for testing
        if (credentials.email === "test@example.com" && credentials.password === "password123") {
          return {
            id: "999",
            name: "Test User",
            email: "test@example.com"
          };
        }
        
        try {
          // Use fetch to call your login API
          const res = await fetch(`${process.env.NEXTAUTH_URL}app/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });
          
          // Add detailed logging
          console.log(`Auth response status: ${res.status}`);
          
          const user = await res.json();
          
          console.log("Auth response data:", JSON.stringify(user));
          
          if (res.ok && user) {
            return user;
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  // ... other NextAuth configuration options
};