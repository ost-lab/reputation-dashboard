"use client";
import { useState, useEffect } from "react";
import RecentMentions from "./RecentMentions"; // Import your UI component

export default function DashboardReviewsContainer() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        // 1. Fetch from the API route we created earlier
        const res = await fetch("/api/reviews");
        const data = await res.json();

        if (data.reviews) {
          // 2. TRANSFORM the data to match RecentMentions interface
          const formattedReviews = data.reviews.map((r: any, index: number) => {
            
            // Booking.com splits text into "Pros" and "Cons", so we combine them
            let content = r.title ? `"${r.title}" ` : "";
            if (r.pros) content += `\n+ ${r.pros} `;
            if (r.cons) content += `\n- ${r.cons}`;

            return {
              id: r.review_id || index, // Use index if ID is missing
              author_name: r.author.name || "Guest",
              rating: Number(r.average_score),
              content: content.trim(),
              platform: "booking", // Lowercase to match your icon helper likely
              created_at: new Date(r.date), // Convert string to Date object
            };
          });

          setReviews(formattedReviews);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    // Optional: A simple skeleton or loading state
    return <div className="p-6 text-gray-400 text-sm">Loading reviews...</div>;
  }

  // 3. Pass the transformed data to your component
  return <RecentMentions reviews={reviews} />;
}