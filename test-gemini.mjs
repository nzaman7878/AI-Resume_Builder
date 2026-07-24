import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const res = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: 'hello' });
    console.log("gemini-3.5-flash success:", res.text);
  } catch (e) {
    console.log("gemini-3.5-flash error:", e.message);
  }
}
test();
