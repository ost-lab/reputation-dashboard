import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; 

export async function POST(request) {
  try {
    const { platform } = await request.json();
    const p = platform.toLowerCase();

    let newFoundReviews = [];

    // --- 1. SMART DATA GENERATION ---
    
    // A. AUTOMOTIVE (Cars.com, DealerRater, Edmunds)
    if (p.includes('car') || p.includes('dealer') || p.includes('edmunds') || p.includes('auto')) {
        newFoundReviews = [
            { user_name: "Mike The Mechanic", source: platform, text: "Bought a used F-150 here. Sales team was honest, but finance took forever.", rating: 4, mock_sentiment: "positive", mock_reply: "Glad we could get you in that truck, Mike!" },
            { user_name: "Sarah Jenkins", source: platform, text: "Service department charged me for an air filter I didn't need.", rating: 1, mock_sentiment: "negative", mock_reply: "Sarah, please contact our Service Manager immediately." }
        ];
    }
    // B. REAL ESTATE (Zillow, Realtor, Trulia)
    else if (p.includes('zillow') || p.includes('realtor') || p.includes('trulia') || p.includes('housing')) {
        newFoundReviews = [
            { user_name: "NewHomeOwner2024", source: platform, text: "Helped us find our dream home in a tough market. Highly recommended!", rating: 5, mock_sentiment: "positive", mock_reply: "It was a pleasure helping you find your home!" },
            { user_name: "Renter_01", source: platform, text: "Never calls back. Property manager is a ghost.", rating: 2, mock_sentiment: "negative", mock_reply: "We apologize for the communication delay." }
        ];
    }
    // C. HEALTHCARE (Healthgrades, Vitals, ZocDoc)
    else if (p.includes('health') || p.includes('doctor') || p.includes('medical') || p.includes('doc')) {
        newFoundReviews = [
            { user_name: "Patient J.D.", source: platform, text: "Dr. Smith is amazing, but the waiting room time was over 45 minutes.", rating: 3, mock_sentiment: "neutral", mock_reply: "Thank you for your patience, we are optimizing our schedule." },
            { user_name: "RecoveringFast", source: platform, text: "Best clinic in town. Very clean and professional staff.", rating: 5, mock_sentiment: "positive", mock_reply: "We are glad you felt comfortable with us!" }
        ];
    }
    // D. HOSPITALITY (TripAdvisor, Hotels.com, Airbnb)
    else if (p.includes('trip') || p.includes('hotel') || p.includes('booking') || p.includes('bnb')) {
        newFoundReviews = [
            { user_name: "Traveler_World", source: platform, text: "Great location, but the breakfast was cold.", rating: 3, mock_sentiment: "neutral", mock_reply: "Thanks for the feedback, we will check our buffet warmers." },
            { user_name: "VacationFam", source: platform, text: "The view from the room was breathtaking! Will come back.", rating: 5, mock_sentiment: "positive", mock_reply: "We can't wait to host you again!" }
        ];
    }
    // E. TECH / SOFTWARE (G2, Capterra)
    else if (p.includes('g2') || p.includes('capterra') || p.includes('software')) {
        newFoundReviews = [
            { user_name: "SaaS User", source: platform, text: "Features are robust but the UI is a bit outdated.", rating: 4, mock_sentiment: "neutral", mock_reply: "We are launching a UI refresh next month!" },
            { user_name: "Dev_Lead", source: platform, text: "Customer support saved our launch. 10/10.", rating: 5, mock_sentiment: "positive", mock_reply: "Our support team loves to hear this!" }
        ];
    }
    // F. DEFAULT / SOCIAL (Google, Facebook, Yelp, etc.)
    else {
       // Default generic or specific standard ones
       if (p.includes('facebook')) {
          newFoundReviews = [
             { user_name: "Social Mom", source: "Facebook", text: "Love following your page updates!", rating: 5, mock_sentiment: "positive", mock_reply: "Thanks for following!" }
          ];
       } else {
          newFoundReviews = [
             { user_name: "Anonymous Customer", source: platform, text: "Great service, would recommend.", rating: 5, mock_sentiment: "positive", mock_reply: "Thanks for the recommendation!" },
             { user_name: "Local User", source: platform, text: "Had an issue with billing.", rating: 2, mock_sentiment: "negative", mock_reply: "Please DM us to resolve this." }
          ];
       }
    }

    // --- 2. SAVE TO DATABASE (Standard Logic) ---
    const savedReviews = [];

    for (const review of newFoundReviews) {
      const query = `
        INSERT INTO reviews (user_name, source, text, sentiment, rating, ai_reply, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
      `;
      
      const res = await pool.query(query, [
        review.user_name, 
        review.source, 
        review.text, 
        review.mock_sentiment, // Uses the forced color
        review.rating, 
        review.mock_reply      // Uses the pre-written reply
      ]);
      
      savedReviews.push(res.rows[0]);
    }

    return NextResponse.json({ success: true, newReviews: savedReviews.length });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}