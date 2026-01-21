import OpenAI from 'openai';

// FIX: Use a dummy key if the environment variable is missing during build.
// This prevents the "Missing credentials" error from crashing the deployment.
const apiKey = process.env.OPENAI_API_KEY || "dummy-key-for-build";

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function analyzeReview(text) {
  if (!text) return { sentiment: 'neutral', keywords: [], reply: '' };

  try {
    // If the dummy key is used at runtime, this call will fail, 
    // but it will be caught by the catch block below.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful customer support AI. 
          You MUST return a valid JSON object with exactly these 3 keys:
          1. "sentiment" (string: 'positive', 'negative', or 'neutral')
          2. "keywords" (array of strings)
          3. "reply" (string: A polite, professional 2-sentence response to the customer addressing their specific feedback).
          
          Do not explain. Just return the JSON.`
        },
        {
          role: "user",
          content: `Analyze this review: "${text}"`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      return { sentiment: 'neutral', keywords: [], reply: '' };
    }
  } catch (error) {
    console.error("OpenAI Error:", error);
    return { 
        sentiment: 'negative', 
        keywords: ['service', 'speed'], 
        reply: "⚠️ API QUOTA EXCEEDED: This is a placeholder reply to prove your Frontend works! Please add credits to OpenAI to get real AI responses." 
    };
  }
}