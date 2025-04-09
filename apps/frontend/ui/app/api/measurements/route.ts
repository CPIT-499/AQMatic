import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function GET() {
  try {
    // Connect to the database and query the measurement_summary_view
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM measurement_summary_view');
      return NextResponse.json(result.rows);
    } finally {
      client.release(); // Release the client back to the pool
    }
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch measurements from database' },
      { status: 500 }
    );
  }
}
