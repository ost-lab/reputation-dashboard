import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platformFilter = searchParams.get('platform'); 

    // 🔍 DEBUG LOG
    console.log(`🔍 API REQUEST - User: ${session.user.id} | Filter: ${platformFilter}`);

    const client = await pool.connect();
    try {
      const userId = session.user.id;
      
      // 1. Build Stats Query Logic
      let filterClause = "";
      let queryParams = [userId];

      if (platformFilter && platformFilter !== 'all') {
        filterClause = "AND LOWER(platform) = LOWER($2)";
        queryParams.push(platformFilter);
      }

      // 2. Execute Stats Queries
      const statsQuery = await client.query(`
        SELECT 
          COUNT(*) as total_mentions,
          AVG(rating) as avg_rating,
          SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
          SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count
        FROM reviews
        WHERE user_id = $1 ${filterClause}
      `, queryParams);

      const stats = statsQuery.rows[0];

      const recentQuery = await client.query(`
        SELECT * FROM reviews 
        WHERE user_id = $1 ${filterClause}
        ORDER BY created_at DESC 
        LIMIT 5
      `, queryParams);

      // 3. ✅ NEW: Get ALL Connected Platforms for this user
      // This tells the frontend which tabs to force-open
      const connectedQuery = await client.query(`
        SELECT DISTINCT platform FROM connected_accounts 
        WHERE user_id = $1
      `, [userId]);
      
      const connectedPlatforms = connectedQuery.rows.map(row => row.platform);

      console.log(`✅ API SUCCESS - Found ${stats.total_mentions} reviews`);

      return NextResponse.json({
        totalMentions: parseInt(stats.total_mentions || '0'),
        avgRating: parseFloat(stats.avg_rating || '0').toFixed(1),
        positive: parseInt(stats.positive_count || '0'),
        negative: parseInt(stats.negative_count || '0'),
        recentMentions: recentQuery.rows,
        // Send the list of connected apps back to UI
        connectedPlatforms: connectedPlatforms
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}