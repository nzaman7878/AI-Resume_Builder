import { GoogleGenAI } from "@google/genai";

export async function generateAiContent(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw new Error("Failed to generate AI content.");
  }
}
