"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function ResumeEditor() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Initialize react-hook-form with setValue
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: "",
      personalInfo: { fullName: "", email: "", phone: "", location: "" },
      summary: "",
    }
  });

  const liveData = watch();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await axios.get(`/api/resumes/${params.id}`);
        reset(data);
      } catch (error) {
        console.error("Failed to load resume", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [params.id, reset, router]);

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

  const generateAISummary = async () => {
    const currentSummary = liveData.summary;
    if (!currentSummary) {
      alert("Please write a rough draft first!");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/generate-summary", { draft: currentSummary });
      setValue("summary", data.summary);
    } catch (error) {
      console.error("AI failed", error);
      alert("Failed to generate AI summary");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold">Loading Editor...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* LEFT COLUMN: THE FORM (Hidden when printing via print:hidden) */}
      <div className="w-1/2 flex flex-col bg-white border-r shadow-lg overflow-y-auto print:hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">
            <ArrowLeft size={16} className="mr-1" /> Dashboard
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium transition"
            >
              <Download size={16} />
              PDF
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 font-medium transition"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Document Title</label>
            <input 
              {...register("title")} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="e.g. Software Engineer Resume"
            />
          </div>

          <hr />

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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Professional Summary</label>
              <button
                type="button"
                onClick={generateAISummary}
                disabled={generating}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-bold disabled:opacity-50 transition"
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
        </div>
      </div>

      {/* RIGHT COLUMN: THE LIVE PREVIEW (Takes up full screen when printing) */}
      <div className="w-1/2 p-8 overflow-y-auto bg-gray-200 flex justify-center print:w-full print:bg-white print:p-0">
        
        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 print:shadow-none print:p-0">
          
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