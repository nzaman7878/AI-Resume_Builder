"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResumeEditor() {
  const [generating, setGenerating] = useState(false);

  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize react-hook-form
   const { register, handleSubmit, reset, watch } =  useForm({
    defaultValues: {
      title: "",
      personalInfo: { fullName: "", email: "", phone: "", location: "" },
      summary: "",
    }
  });

  // 'watch' gives us the live values of the form as the user types
  const liveData = watch();

  // Fetch the existing resume data
  useEffect(() => {
    const fetchResume = async () => {
      try {
        // params.id is the ID from the URL (e.g. /resume/12345)
        const { data } = await axios.get(`/api/resumes/${params.id}`);
        // Populate the form with the data from the database
        reset(data);
      } catch (error) {
        console.error("Failed to load resume", error);
        router.push("/dashboard"); // Go back if not found
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [params.id, reset, router]);

  // Handle saving to the database
  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      await axios.put(`/api/resumes/${params.id}`, formData);
      alert("Resume saved successfully!");
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold">Loading Editor...</div>;

    const generateAISummary = async () => {
    // Get whatever is currently typed in the summary box
    const currentSummary = liveData.summary;
    if (!currentSummary) {
      alert("Please write a rough draft first!");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/generate-summary", { draft: currentSummary });
      // Tell react-hook-form to update the summary field with the AI response
      setValue("summary", data.summary);
    } catch (error) {
      console.error("AI failed", error);
      alert("Failed to generate AI summary");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* LEFT COLUMN: THE FORM */}
      <div className="w-1/2 flex flex-col bg-white border-r shadow-lg overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-indigo-600">
            <ArrowLeft size={16} className="mr-1" /> Dashboard
          </Link>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Resume"}
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Document Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Document Title</label>
            <input 
              {...register("title")} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="e.g. Software Engineer Resume"
            />
          </div>

          <hr />

          {/* Personal Info */}
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Personal Details</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                <input {...register("personalInfo.fullName")} className="w-full p-2 border rounded" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input {...register("personalInfo.email")} className="w-full p-2 border rounded" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input {...register("personalInfo.phone")} className="w-full p-2 border rounded" placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Location</label>
                <input {...register("personalInfo.location")} className="w-full p-2 border rounded" placeholder="New York, NY" />
              </div>
            </div>
          </div>

          <hr />

          {/* Professional Summary */}
                    {/* Professional Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Professional Summary</label>
              <button
                type="button"
                onClick={generateAISummary}
                disabled={generating}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-bold disabled:opacity-50"
              >
                {generating ? "✨ Enhancing..." : "✨ Enhance with AI"}
              </button>
            </div>
            <textarea 
              {...register("summary")} 
              rows={5}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="Briefly describe your professional background, or write a rough draft and click 'Enhance with AI'!"
            />
          </div>
          
          {/* NOTE: You can add Experience and Education sections here later! */}
          <div className="text-sm text-gray-400 italic mt-8 text-center">
            (You can add form inputs for Experience and Education here)
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: THE LIVE PREVIEW */}
      <div className="w-1/2 p-8 overflow-y-auto bg-gray-200 flex justify-center">
        {/* This represents the physical A4 paper */}
        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 print:shadow-none print:p-0">
          
          {/* Render the watched data! */}
          <div className="border-b-2 border-gray-800 pb-4 mb-4 text-center">
            <h1 className="text-4xl font-serif text-gray-900 tracking-tight">
              {liveData?.personalInfo?.fullName || "Your Name"}
            </h1>
            <div className="flex justify-center gap-4 text-gray-600 mt-2 text-sm">
              <span>{liveData?.personalInfo?.email || "Email"}</span>
              <span>•</span>
              <span>{liveData?.personalInfo?.phone || "Phone"}</span>
              <span>•</span>
              <span>{liveData?.personalInfo?.location || "Location"}</span>
            </div>
          </div>

          {liveData?.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2">Summary</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {liveData.summary}
              </p>
            </div>
          )}

          {/* Placeholder for Experience and Education in the preview */}
          <div className="mb-6 opacity-30">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">Experience</h2>
            <div className="mt-2">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Software Engineer at Tech Corp</span>
                <span>2020 - Present</span>
              </div>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                <li>Experience bullet points will appear here</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}