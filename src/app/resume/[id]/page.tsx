"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Download, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface FormValues {
  title: string;
  personalInfo: { fullName: string; email: string; phone: string; location: string };
  summary: string;
  experience: { company: string; position: string; startDate: string; endDate: string; description: string }[];
  education: { school: string; degree: string; startDate: string; endDate: string }[];
  skills: string[];
}

export default function ResumeEditor() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // Custom toast message

  const { register, handleSubmit, reset, watch, setValue, control } = useForm<FormValues>({
    defaultValues: {
      title: "",
      personalInfo: { fullName: "", email: "", phone: "", location: "" },
      summary: "",
      experience: [],
      education: [],
      skills: [],
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  
  // For skills, we can handle it as a single string input that splits by comma
  const [skillsText, setSkillsText] = useState("");

  const liveData = watch();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await axios.get(`/api/resume/${params.id}`);
        reset(data);
        if (data.skills && Array.isArray(data.skills)) {
          setSkillsText(data.skills.join(", "));
        }
      } catch (error) {
        console.error("Failed to load resume", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [params.id, reset, router]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const onSubmit = async (formData: any) => {
    setSaving(true);
    // Parse skills from skillsText
    const parsedSkills = skillsText.split(",").map(s => s.trim()).filter(Boolean);
    formData.skills = parsedSkills;

    try {
      await axios.put(`/api/resume/${params.id}`, formData);
      showMessage("Resume saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save", error);
      showMessage("Failed to save resume", "error");
    } finally {
      setSaving(false);
    }
  };

  const generateAISummary = async () => {
    const currentSummary = liveData.summary;
    if (!currentSummary) {
      showMessage("Please write a rough draft first!", "error");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/generate-summary", { draft: currentSummary });
      setValue("summary", data.summary);
      showMessage("Summary enhanced with AI!", "success");
    } catch (error) {
      console.error("AI failed", error);
      showMessage("Failed to generate AI summary", "error");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold">Loading Editor...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* LEFT COLUMN: THE FORM */}
      <div className="w-1/2 flex flex-col bg-white border-r shadow-lg overflow-y-auto print:hidden relative">
        {/* Toast Message */}
        {message.text && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md text-white font-medium z-50 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message.text}
          </div>
        )}

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
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Document Title</label>
            <input 
              id="title"
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
                <label htmlFor="fullName" className="block text-xs text-gray-500 mb-1">Full Name</label>
                <input id="fullName" {...register("personalInfo.fullName")} className="w-full p-2 border rounded" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs text-gray-500 mb-1">Email</label>
                <input id="email" {...register("personalInfo.email")} className="w-full p-2 border rounded" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs text-gray-500 mb-1">Phone</label>
                <input id="phone" {...register("personalInfo.phone")} className="w-full p-2 border rounded" placeholder="(555) 123-4567" />
              </div>
              <div>
                <label htmlFor="location" className="block text-xs text-gray-500 mb-1">Location</label>
                <input id="location" {...register("personalInfo.location")} className="w-full p-2 border rounded" placeholder="New York, NY" />
              </div>
            </div>
          </div>

          <hr />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="summary" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Professional Summary</label>
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
              id="summary"
              {...register("summary")} 
              rows={5}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="Briefly describe your professional background, or write a rough draft and click 'Enhance with AI'!"
            />
          </div>

          <hr />

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Experience</label>
              <button type="button" onClick={() => appendExp({ company: "", position: "", startDate: "", endDate: "", description: "" } as never)} className="text-sm flex items-center text-indigo-600 font-medium">
                <Plus size={16} /> Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded relative bg-gray-50">
                  <button type="button" onClick={() => removeExp(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Company</label>
                      <input {...register(`experience.${index}.company`)} className="w-full p-2 border rounded" placeholder="Company Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Position</label>
                      <input {...register(`experience.${index}.position`)} className="w-full p-2 border rounded" placeholder="Job Title" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input {...register(`experience.${index}.startDate`)} className="w-full p-2 border rounded" placeholder="MM/YYYY" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input {...register(`experience.${index}.endDate`)} className="w-full p-2 border rounded" placeholder="MM/YYYY or Present" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea {...register(`experience.${index}.description`)} className="w-full p-2 border rounded" rows={3} placeholder="Describe your responsibilities and achievements..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr />

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Education</label>
              <button type="button" onClick={() => appendEdu({ school: "", degree: "", startDate: "", endDate: "" } as never)} className="text-sm flex items-center text-indigo-600 font-medium">
                <Plus size={16} /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded relative bg-gray-50">
                  <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School</label>
                      <input {...register(`education.${index}.school`)} className="w-full p-2 border rounded" placeholder="University Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Degree</label>
                      <input {...register(`education.${index}.degree`)} className="w-full p-2 border rounded" placeholder="B.S. Computer Science" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input {...register(`education.${index}.startDate`)} className="w-full p-2 border rounded" placeholder="YYYY" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input {...register(`education.${index}.endDate`)} className="w-full p-2 border rounded" placeholder="YYYY or Present" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr />

          <div>
            <label htmlFor="skills" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Skills</label>
            <p className="text-xs text-gray-500 mb-2">Comma separated (e.g. JavaScript, React, Node.js)</p>
            <input 
              id="skills"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="React, TypeScript, Next.js..."
            />
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: THE LIVE PREVIEW */}
      <div className="w-1/2 p-8 overflow-y-auto bg-gray-200 flex justify-center print:w-full print:bg-white print:p-0">
        
        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 print:shadow-none print:p-0">
          
          <div className="border-b-2 border-gray-800 pb-4 mb-4 text-center">
            <h1 className="text-4xl font-serif text-gray-900 tracking-tight">
              {liveData?.personalInfo?.fullName || "Your Name"}
            </h1>
            <div className="flex justify-center gap-4 text-gray-600 mt-2 text-sm">
              {liveData?.personalInfo?.email && <span>{liveData.personalInfo.email}</span>}
              {liveData?.personalInfo?.email && liveData?.personalInfo?.phone && <span>•</span>}
              {liveData?.personalInfo?.phone && <span>{liveData.personalInfo.phone}</span>}
              {(liveData?.personalInfo?.email || liveData?.personalInfo?.phone) && liveData?.personalInfo?.location && <span>•</span>}
              {liveData?.personalInfo?.location && <span>{liveData.personalInfo.location}</span>}
            </div>
          </div>

          {liveData?.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2">Summary</h2>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                {liveData.summary}
              </p>
            </div>
          )}

          {liveData?.experience && liveData.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">Experience</h2>
              <div className="mt-2 space-y-4">
                {liveData.experience.map((exp: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between font-bold text-gray-800 text-sm">
                      <span>{exp.position} {exp.company && `at ${exp.company}`}</span>
                      <span>{exp.startDate} {exp.startDate && exp.endDate && "-"} {exp.endDate}</span>
                    </div>
                    {exp.description && (
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.education && liveData.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">Education</h2>
              <div className="mt-2 space-y-3">
                {liveData.education.map((edu: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-bold text-gray-800">{edu.school}</span>
                      {edu.degree && <span className="text-gray-700">, {edu.degree}</span>}
                    </div>
                    <span className="font-bold text-gray-800">{edu.startDate} {edu.startDate && edu.endDate && "-"} {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skillsText.trim() && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">Skills</h2>
              <p className="text-sm text-gray-700">
                {skillsText}
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}