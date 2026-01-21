"use client";
import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function CsvUploader() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("Reading file...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      
      // Simple CSV Parser
      // Assumes format: Name,Rating,Comment
      const rows = text.split('\n').slice(1); // Skip header
      
      const reviews = rows.map(row => {
        // Split by comma, but handle potential issues simply for now
        const cols = row.split(',');
        if (cols.length < 3) return null; 
        
        return {
          user: cols[0]?.trim(),
          rating: cols[1]?.trim(),
          // Join the rest in case the comment itself had commas
          text: cols.slice(2).join(',').trim().replace(/^"|"$/g, ''), 
          source: "CSV Import"
        };
      }).filter(r => r !== null && r.user);

      if (reviews.length === 0) {
        setMessage("❌ No valid reviews found in file.");
        setUploading(false);
        return;
      }

      try {
        const res = await fetch('/api/reviews/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviews }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessage(`✅ ${data.message}`);
          // Reload page to show new stats
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage("❌ Upload failed.");
        }
      } catch (err) {
        setMessage("❌ Network error.");
      } finally {
        setUploading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mt-6">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
        <FileText size={20} className="text-blue-600"/> 
        Import Reviews (CSV)
      </h3>
      
      <p className="text-sm text-gray-500 mb-4">
        Upload a file with columns: <b>Name, Rating, Comment</b>
      </p>

      <label className="cursor-pointer flex flex-col items-center justify-center gap-2 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition">
        {uploading ? (
          <span className="text-sm font-medium text-blue-600 animate-pulse">Uploading...</span>
        ) : (
          <>
            <Upload size={24} className="text-blue-500"/>
            <span className="text-sm font-medium text-blue-700">Click to Select CSV File</span>
          </>
        )}
        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
      </label>

      {message && (
        <p className={`text-sm font-medium text-center mt-3 ${message.includes('❌') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}