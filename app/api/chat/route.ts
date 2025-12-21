import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Cache to store website content (in-memory cache)
let websiteContentCache: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for localhost (shorter cache)

async function fetchWebsiteContent() {
  // Return cached content if it's still fresh
  if (websiteContentCache && Date.now() - lastFetchTime < CACHE_DURATION) {
    console.log("✅ Using cached website content");
    return websiteContentCache;
  }

  try {
    console.log("🌐 Fetching fresh website content...");
    
    // BASE URL - change this if your port is different
    const BASE_URL = "http://localhost:3000";
    
    // ADD YOUR PAGE URLS HERE
    const pagesToScrape = [
      `${BASE_URL}/`,
      `${BASE_URL}/about`,
      `${BASE_URL}/products`,
      `${BASE_URL}/products`,
      `${BASE_URL}/policies/shipping`,
      `${BASE_URL}/policies/return-and-refund`,
      `${BASE_URL}/policies/terms-and-conditions`,
      `${BASE_URL}/policies/privacy-policy`,
      // ADD MORE PAGES HERE - I'll wait for your list
    ];

    const contentPromises = pagesToScrape.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CollidedGalaxiesChatbot/1.0)',
          },
          cache: 'no-store' // Don't cache during development
        });
        
        if (!response.ok) {
          console.log(`⚠️ Failed to fetch ${url} - Status: ${response.status}`);
          return "";
        }

        const html = await response.text();
        
        // Extract text content (remove HTML tags)
        const textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        console.log(`✅ Fetched ${url} - ${textContent.length} chars`);
        return `\n--- Content from ${url} ---\n${textContent.substring(0, 5000)}\n`;
      } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error);
        return "";
      }
    });

    const contents = await Promise.all(contentPromises);
    websiteContentCache = contents.join('\n');
    lastFetchTime = Date.now();
    
    console.log(`✅ Total pages fetched: ${contents.length}, total content length: ${websiteContentCache.length} chars`);
    return websiteContentCache;
  } catch (error) {
    console.error("❌ Error fetching website content:", error);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    console.log("=== CHAT API CALLED ===");
    
    const { message } = await req.json();
    console.log("User message:", message);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { reply: "Please provide a valid message." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing!");
      return NextResponse.json(
        { reply: "Chatbot configuration error." },
        { status: 500 }
      );
    }

    console.log("✅ API Key found");

    // Fetch website content
    const websiteContent = await fetchWebsiteContent();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ GoogleGenerativeAI initialized");
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite"
    });
    console.log("✅ Model created: gemini-2.0-flash-lite");

    const systemPrompt = `You are the official customer support chatbot for Collided Galaxies, a clothing e-commerce brand specializing in oversized unisex t-shirts.

WEBSITE INFORMATION:
${websiteContent}

YOUR ROLE:
- Answer questions based ONLY on the website content provided above
- Provide outfit and color suggestions
- Help with size & fit questions
- Share material and product information
- Explain shipping, returns, COD, and delivery policies
- Recommend products from the collections

RULES:
1. ONLY answer questions related to Collided Galaxies clothing, products, and policies
2. If you don't have specific information from the website content, say "Let me check our website for that information" or direct them to contact support
3. If user asks unrelated questions, reply: "I can help only with clothing or Collided Galaxies-related questions 😊"
4. Be friendly, helpful, and concise
5. Always base your answers on the website content provided above

User question: ${message}`;

    console.log("Sending request to Gemini...");
    const result = await model.generateContent(systemPrompt);
    console.log("✅ Got result from Gemini");
    
    const response = await result.response;
    const reply = response.text();
    console.log("✅ Reply sent successfully");

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ FULL ERROR:", error);
    console.error("Error message:", error.message);
    
    return NextResponse.json(
      { 
        reply: "I'm having trouble responding right now. Please try again in a moment! 😊"
      },
      { status: 200 }
    );
  }
}