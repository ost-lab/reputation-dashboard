import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getRecentReviews() {
  const session = await getServerSession(authOptions);
  
  // 1. If not logged in, return empty
  if (!session || !session.user?.id) return [];

  const client = await pool.connect();
  try {
    // 2. Fetch last 10 reviews from DB (Newest First)
    const res = await client.query(`
      SELECT * FROM reviews 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [session.user.id]);
    
    return res.rows;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  } finally {
    client.release();
  }
}