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
    const platformFilter = searchParams.get('platform'); // 'google', 'booking', or undefined

    const client = await pool.connect();

    try {
      // 1. Build Query Conditions
      let queryParams: any[] = [session.user.id];
      let whereClause = "WHERE user_id = $1";

      if (platformFilter && platformFilter !== 'all') {
          whereClause += " AND platform = $2";
          queryParams.push(platformFilter);
      }

      // 2. Fetch Stats
      // A. Total Count
      const countRes = await client.query(`SELECT COUNT(*) FROM reviews ${whereClause}`, queryParams);
      const totalMentions = parseInt(countRes.rows[0].count);

      // B. Positive Count
      const posRes = await client.query(`SELECT COUNT(*) FROM reviews ${whereClause} AND sentiment = 'positive'`, queryParams);
      const positive = parseInt(posRes.rows[0].count);

      // C. Negative Count
      const negRes = await client.query(`SELECT COUNT(*) FROM reviews ${whereClause} AND sentiment = 'negative'`, queryParams);
      const negative = parseInt(negRes.rows[0].count);

      // D. Avg Rating
      const avgRes = await client.query(`SELECT AVG(rating) FROM reviews ${whereClause}`, queryParams);
      const avgRating = parseFloat(avgRes.rows[0].avg || "0").toFixed(1);

      // E. Recent Mentions (Limit 10)
      const reviewsRes = await client.query(`
          SELECT * FROM reviews 
          ${whereClause} 
          ORDER BY created_at DESC 
          LIMIT 10
      `, queryParams);

      // F. Connected Platforms (To auto-activate tabs)
      const connectedRes = await client.query(
          "SELECT platform, connected_label FROM connected_accounts WHERE user_id = $1", 
          [session.user.id]
      );
      const connectedPlatforms = connectedRes.rows.map(r => r.platform);
      
      // Map connected labels for UI
      const connectedAccounts: Record<string, string> = {};
      connectedRes.rows.forEach(r => {
          connectedAccounts[r.platform] = r.connected_label;
      });

      // G. Platform Distribution (For Charts)
      const distRes = await client.query(`
          SELECT platform, COUNT(*) as count 
          FROM reviews 
          WHERE user_id = $1 
          GROUP BY platform
      `, [session.user.id]);
      
      const platformDistribution = distRes.rows.map(r => ({
          name: r.platform,
          value: parseInt(r.count)
      }));

      return NextResponse.json({
        totalMentions,
        positive,
        negative,
        avgRating,
        recentMentions: reviewsRes.rows,
        connectedPlatforms,
        connectedAccounts,
        platformDistribution,
        sentimentDistribution: [
            { name: "Positive", value: positive, color: "#22c55e" },
            { name: "Neutral", value: totalMentions - (positive + negative), color: "#eab308" },
            { name: "Negative", value: negative, color: "#ef4444" }
        ]
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}