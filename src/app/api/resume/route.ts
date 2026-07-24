import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { getUserIdFromToken } from "@/lib/auth";

// GET all resumes for the logged-in user
export async function GET() {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
  
  return NextResponse.json(resumes);
}

// POST (Create a new blank resume)
export async function POST(req: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await connectToDatabase();
    
    const newResume = await Resume.create({
      userId,
      title: body.title || "Untitled Resume",
    });

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error("POST resume error:", error);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}