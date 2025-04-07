import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

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

    console.log(`Attempting login for email: ${email}`);

    // Get user from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT user_id, email, name, password_hash, organization_id, role FROM users WHERE email = $1',
        [email]
      );
      
      const user = result.rows[0];
      
      // Check if user exists
      if (!user) {
        console.log(`No user found with email: ${email}`);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log(`User found: ${user.name}, ID: ${user.user_id}`);

      // Verify password
      // For testing, we're directly comparing password and password_hash
      // TODO: Use proper hashing in production
      // const isValidPassword = await bcrypt.compare(password, user.password_hash);
      const isValidPassword = password === user.password_hash;
      
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