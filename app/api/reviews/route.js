import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { analyzeReview } from '../../../lib/openai';

// 1. GET REVIEWS
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST NEW REVIEW (With AI Reply)
export async function POST(request) {
  try {
    const body = await request.json();
    
    const userNameInput = body.user_name || body.user || "Anonymous";
    const sourceInput = body.source || "Manual";
    const textInput = body.text || "";
    const ratingInput = parseInt(body.rating) || 5;

    // A. Ask AI for analysis AND reply
    let sentiment = 'neutral';
    let reply = ''; 

   try {
      const aiResult = await analyzeReview(textInput);
      if (aiResult) {
        sentiment = aiResult.sentiment || 'neutral';
        reply = aiResult.reply || ""; 
      }
    } catch (err) {
      console.log("AI Analysis failed:", err.message);
    }

    // --- 2. THE SAFETY NET (Fixes your Red 5-Star issue) ---
    // If the rating is high, FORCE Positive (ignoring AI errors)
    if (ratingInput >= 4) {
        sentiment = 'positive';
    } 
    // If the rating is low, FORCE Negative
    else if (ratingInput <= 2) {
        sentiment = 'negative';
    }
    // If 3 stars and AI failed (neutral), keep it neutral or make it mixed
    // (Logic: Stars always tell the truth more than AI)

    console.log(`Saving Review: ${ratingInput} Stars -> Sentiment: ${sentiment}`);

    // 3. Insert into DB
    const query = `
      INSERT INTO reviews (user_name, source, text, sentiment, rating, ai_reply, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    
    const result = await pool.query(query, [
      userNameInput, sourceInput, textInput, sentiment, ratingInput, reply
    ]);
    
    return NextResponse.json(result.rows[0]);
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. UPDATE REVIEW (Save Reply)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, reply } = body;

    if (!id || !reply) {
      return NextResponse.json({ error: "ID and Reply text required" }, { status: 400 });
    }

    // Save the admin_reply to the database
    const query = 'UPDATE reviews SET admin_reply = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [reply, id]);
    
    return NextResponse.json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}