import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    // This SQL query groups data by user name
    const query = `
      SELECT 
        user_name, 
        COUNT(*) as total_reviews, 
        AVG(rating) as avg_rating,
        MAX(created_at) as last_seen,
        STRING_AGG(source, ', ') as sources
      FROM reviews 
      GROUP BY user_name 
      ORDER BY total_reviews DESC;
    `;
    
    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}