import { redirect } from "next/navigation";
import { getUserIdFromToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import ResumeEditorClient from "./ResumeEditorClient";

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromToken();

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  await connectToDatabase();
  const resume = await Resume.findOne({ _id: id, userId }).lean();

  if (!resume) {
    // If the resume doesn't exist or belongs to someone else, redirect to dashboard
    redirect("/dashboard");
  }

  // Format data for the client component (matches the structure of FormValues)
  const formattedData = {
    title: resume.title || "",
    personalInfo: resume.personalInfo || { fullName: "", email: "", phone: "", location: "", github: "", portfolio: "" },
    summary: resume.summary || "",
    experience: resume.experience || [],
    education: resume.education || [],
    projects: resume.projects?.map((p: any) => ({ ...p, techStack: p.techStack?.join(", ") || "" })) || [],
    skills: resume.skills?.join(", ") || "",
    certifications: resume.certifications?.join(", ") || "",
  };

  return <ResumeEditorClient initialData={formattedData as any} resumeId={id} />;
}