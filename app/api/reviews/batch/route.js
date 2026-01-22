import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { analyzeReview } from '../../../../lib/openai'; // <--- Import the AI

export async function POST(request) {
  try {
    const body = await request.json();
    const { reviews } = body;

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ error: "No reviews provided" }, { status: 400 });
    }

    let savedCount = 0;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Process reviews one by one
      for (const review of reviews) {
        // 1. Analyze with AI
        // (We await this, so it might take a moment for large files)
        const aiAnalysis = await analyzeReview(review.text);
        
        const sentiment = aiAnalysis.sentiment || 'neutral';
        const starRating = parseInt(review.rating) || 0;

        const query = `
          INSERT INTO reviews (user_name, source, text, sentiment, rating, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `;
        
        await client.query(query, [
          review.user || "Anonymous",
          review.source || "Imported CSV",
          review.text || "",
          sentiment,
          starRating
        ]);
        savedCount++;
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: `Successfully analyzed and imported ${savedCount} reviews` });

  } catch (error) {
    console.error("Batch Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}