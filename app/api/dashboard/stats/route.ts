import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

// 🚨 CRITICAL: This forces Next.js to fetch fresh data every time (Fixes the "0 reviews" cache bug)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Security Check
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const userId = session.user.id;

      // 2. Get Summary Stats (Counts & Averages)
      const statsQuery = await client.query(`
        SELECT 
          COUNT(*) as total_mentions,
          AVG(rating) as avg_rating,
          SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count
        FROM reviews
        WHERE user_id = $1
      `, [userId]);

      const stats = statsQuery.rows[0];

      // 3. Get Recent Mentions (Limit 5 for the list)
      // ✅ Uses 'created_at' to sort (Fixes the "column date does not exist" error)
      const recentQuery = await client.query(`
        SELECT * FROM reviews 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 5
      `, [userId]);

      // 4. Get Platform Distribution (For Pie Chart)
      const platformQuery = await client.query(`
        SELECT platform, COUNT(*) as count 
        FROM reviews 
        WHERE user_id = $1 
        GROUP BY platform
      `, [userId]);

      // 5. Get Sentiment Distribution (For Bar Chart)
      const sentimentQuery = await client.query(`
        SELECT sentiment, COUNT(*) as count 
        FROM reviews 
        WHERE user_id = $1 
        GROUP BY sentiment
      `, [userId]);

      // 6. Return JSON matching the Dashboard Frontend expectations
      return NextResponse.json({
        totalMentions: parseInt(stats.total_mentions || '0'),
        avgRating: parseFloat(stats.avg_rating || '0').toFixed(1),
        positive: parseInt(stats.positive_count || '0'),
        negative: parseInt(stats.negative_count || '0'),
        recentMentions: recentQuery.rows,
        platformDistribution: platformQuery.rows,
        sentimentDistribution: sentimentQuery.rows
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}