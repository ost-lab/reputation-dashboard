'use client';
import { useState, useEffect } from 'react';

export default function ReviewSummary({ hotelId }: { hotelId: string }) {
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchMetadata() {
      // Calls your new API route
      const res = await fetch(`/api/reviews/metadata?hotel_id=${hotelId}`);
      const data = await res.json();
      setMeta(data);
    }
    fetchMetadata();
  }, [hotelId]);

  if (!meta) return <div>Loading scores...</div>;

  // The structure of the response usually puts scores in `data.data` or `data.result`
  // Depending on the exact API response, you might need to adjust this path.
  // This example assumes a common Booking.com structure.
  
  return (
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="text-xl font-bold mb-4">Review Summary</h3>
      
      {/* Display Score Breakdown if available */}
      {meta.data && meta.data.a_href ? (
         <div className="grid grid-cols-2 gap-4">
             {/* You will need to inspect the console.log(meta) to see the exact 
                 field names, as they change often with this API */}
             <pre>{JSON.stringify(meta.data, null, 2)}</pre>
         </div>
      ) : (
          <p>No metadata available.</p>
      )}
    </div>
  );
}