import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/lib/db";

// 🏗️ TIER 1 ARCHITECTURE: INGESTION ENGINE
// This replaces the fragile "Scraper" with a structured handler.

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Security Layer)
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, url } = body;
    
    if (!url) return NextResponse.json({ error: "Missing Connection Data" }, { status: 400 });

    console.log(`🚀 SYNC ENGINE STARTED: Processing ${platform}...`);

    let reviewsData = [];

    // 2. ROUTING LOGIC (The "Birdeye" Router)
    // We check the platform and decide the ingestion method.
    
    if (platform === 'google') {
        // --- TIER 1: OFFICIAL API STRATEGY ---
        // CURRENT STATUS: Simulation Mode (allows dev without API keys)
        // FUTURE STATUS: Replace this block with 'googleapis' call.
        
        console.log("Using Tier 1: Google Business Profile Simulation");
        reviewsData = generateMockGoogleReviews(); 

    } else if (platform === 'facebook') {
        // --- TIER 1: FACEBOOK GRAPH API ---
        console.log("Using Tier 1: Facebook Graph Simulation");
        reviewsData = generateMockFacebookReviews();

    } else {
        // --- TIER 4: MANUAL / FALLBACK ---
        return NextResponse.json({ error: "Platform not yet supported" }, { status: 400 });
    }

    // 3. UNIFIED DATA NORMALIZATION LAYER
    // Save data to database regardless of where it came from (API, Scraper, or Mock)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Ensure User Exists
      await client.query(`
        INSERT INTO users (id, name, email, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        session.user.id, 
        session.user.name || 'Unknown User', 
        session.user.email || 'no-email@example.com'
      ]);
      
      // Register the Connection
      await client.query(`
        INSERT INTO connected_accounts (user_id, platform, provider_account_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, platform) DO NOTHING
      `, [session.user.id, platform, url]);

      // Save Normalized Reviews
      for (const review of reviewsData) {
        // Calculate a fake past date for realism
        const fakeDate = new Date();
        fakeDate.setDate(fakeDate.getDate() - review.date_offset);

        await client.query(`
          INSERT INTO reviews (
            user_id, platform, rating, content, author_name, sentiment, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          session.user.id,
          platform, 
          review.rating,
          review.content,
          review.author,
          review.sentiment,
          fakeDate
        ]);
      }
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error("DB Transaction Error:", e);
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ 
        message: "Sync successful", 
        method: "Tier 1 (Simulation)", 
        count: reviewsData.length 
    });

  } catch (error) {
    console.error("Sync Engine Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// --- HELPER FUNCTIONS (Simulating the API Response) ---

function generateMockGoogleReviews() {
    return [
      { author: "Sarah Jenkins", rating: 5, content: "Absolutely love the service! Professional team.", sentiment: "positive", date_offset: 0 },
      { author: "Mike Ross", rating: 4, content: "Great experience, slightly pricey.", sentiment: "positive", date_offset: 1 },
      { author: "Emily Clark", rating: 5, content: "Five stars! Fast shipping.", sentiment: "positive", date_offset: 2 },
      { author: "David Wright", rating: 2, content: "Arrived damaged. Support was slow.", sentiment: "negative", date_offset: 5 },
      { author: "Jessica Lee", rating: 3, content: "It's okay. Nothing special.", sentiment: "neutral", date_offset: 7 }
    ];
}

function generateMockFacebookReviews() {
    return [
      { author: "FB User 1", rating: 5, content: "Great community page!", sentiment: "positive", date_offset: 1 },
      { author: "FB User 2", rating: 1, content: "Nobody replies to messages.", sentiment: "negative", date_offset: 3 }
    ];
}