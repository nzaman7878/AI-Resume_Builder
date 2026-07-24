import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { getUserIdFromToken } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const resume = await Resume.findOne({ _id: (await params).id, userId });
  
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(resume);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await connectToDatabase();
    
    // Extract only allowed fields to prevent Mass Assignment
    const allowedUpdates = {
      title: body.title,
      summary: body.summary,
      personalInfo: body.personalInfo,
      education: body.education,
      experience: body.experience,
      projects: body.projects,
      skills: body.skills,
      certifications: body.certifications,
    };
    
    // Remove undefined fields so we don't accidentally overwrite existing data with undefined
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key as keyof typeof allowedUpdates] === undefined && delete allowedUpdates[key as keyof typeof allowedUpdates]
    );
    
    const updatedResume = await Resume.findOneAndUpdate(
      { _id: (await params).id, userId }, // Ensure the user owns this resume
      { $set: allowedUpdates },
      { returnDocument: 'after' } // Return the updated document
    );

    if (!updatedResume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("Failed to update resume:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    const deletedResume = await Resume.findOneAndDelete({ _id: (await params).id, userId });
    
    if (!deletedResume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Resume deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
