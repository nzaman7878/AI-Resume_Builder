import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserIdFromToken } from "@/lib/auth";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  // Ensure the user is logged in before allowing AI usage
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { draft } = await req.json();

    if (!draft) {
      return NextResponse.json({ error: "Draft summary is required" }, { status: 400 });
    }

    const prompt = `
      You are an expert resume writer. Rewrite the following rough draft of a professional summary.
      Make it sound highly professional, action-oriented, and impactful. 
      Keep it to 3-4 sentences maximum. Do not include any conversational filler (like "Here is the summary:").
      
      Rough Draft:
      "${draft}"
    `;

    // Call the Gemini 2.5 Flash model (it's fast and cheap!)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const aiSummary = response.text;

    return NextResponse.json({ summary: aiSummary });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}