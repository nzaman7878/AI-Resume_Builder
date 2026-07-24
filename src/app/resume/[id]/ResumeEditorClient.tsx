"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Download, Plus, Trash2, Wand2, Sparkles, Activity, X } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";

interface FormValues {
  title: string;
  personalInfo: { fullName: string; email: string; phone: string; location: string; github: string; portfolio: string };
  summary: string;
  experience: { company: string; position: string; startDate: string; endDate: string; description: string }[];
  education: { school: string; degree: string; startDate: string; endDate: string }[];
  projects: { title: string; description: string; techStack: string; githubUrl: string; liveUrl: string }[];
  skills: string;
  certifications: string;
}

export default function ResumeEditorClient({ initialData, resumeId }: { initialData: FormValues, resumeId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  
  const [atsScoreData, setAtsScoreData] = useState<any>(null);
  const [showAtsModal, setShowAtsModal] = useState(false);

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        // A4 width in pixels is ~794px at 96 DPI.
        const A4_WIDTH_PX = 794;
        // Padding is 32px on each side (p-8)
        const containerWidth = containerRef.current.clientWidth - 64;
        if (containerWidth < A4_WIDTH_PX) {
          setScale(containerWidth / A4_WIDTH_PX);
        } else {
          setScale(1);
        }
      }
    };
    
    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  const { register, handleSubmit, reset, watch, setValue, control } = useForm<FormValues>({
    defaultValues: initialData
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: "projects" });

  const liveData = watch();



  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const onSubmit = async (formData: FormValues) => {
    setSaving(true);
    const payload = {
      ...formData,
      skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(",").map(s => s.trim()).filter(Boolean),
      projects: formData.projects.map(p => ({
        ...p,
        techStack: p.techStack.split(",").map(s => s.trim()).filter(Boolean)
      }))
    };

    try {
      await axios.put(`/api/resume/${resumeId}`, payload);
      showMessage("Resume saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save", error);
      showMessage("Failed to save resume", "error");
    } finally {
      setSaving(false);
    }
  };

  // AI FUNCTIONS
  const generateAISummary = async () => {
    setGenerating("summary");
    try {
      const { data } = await axios.post("/api/ai/generate-summary", {
        jobTitle: liveData.title || "Professional",
        skills: liveData.skills || "Various skills",
        experienceLevel
      });
      setValue("summary", data.data.summary);
      showMessage("Summary generated!", "success");
    } catch (error) {
      console.error("AI failed", error);
      showMessage("Failed to generate AI summary", "error");
    } finally {
      setGenerating(null);
    }
  };

  const generateAISkills = async () => {
    setGenerating("skills");
    try {
      const { data } = await axios.post("/api/ai/generate-skills", {
        jobTitle: liveData.title || "Professional",
        experienceLevel
      });
      const generatedSkills = Array.isArray(data.data.skills) ? data.data.skills.join(", ") : "";
      setValue("skills", generatedSkills);
      showMessage("Skills generated!", "success");
    } catch (error) {
      console.error("AI failed", error);
      showMessage("Failed to generate skills", "error");
    } finally {
      setGenerating(null);
    }
  };

  const generateAIExperience = async (index: number) => {
    setGenerating(`exp_${index}`);
    try {
      const { data } = await axios.post("/api/ai/generate-experience-description", {
        jobRole: liveData.experience[index].position || liveData.title,
        techStack: liveData.skills || "General",
        yearsOfExperience: "Based on level",
        experienceLevel
      });
      setValue(`experience.${index}.description`, data.data.workExperienceDescription);
      showMessage("Experience generated!", "success");
    } catch (error) {
      console.error("AI failed", error);
      showMessage("Failed to generate experience", "error");
    } finally {
      setGenerating(null);
    }
  };

  const generateAIProject = async (index: number) => {
    setGenerating(`proj_${index}`);
    try {
      const { data } = await axios.post("/api/ai/generate-project-description", {
        jobTitle: liveData.title || "Professional",
        techStack: liveData.projects[index].techStack || liveData.skills || "General",
        experienceLevel
      });
      setValue(`projects.${index}.description`, data.data.projectDescription);
      showMessage("Project generated!", "success");
    } catch (error) {
      console.error("AI failed", error);
      showMessage("Failed to generate project", "error");
    } finally {
      setGenerating(null);
    }
  };

  const improveContent = async (fieldPath: any, content: string) => {
    if (!content) return showMessage("Provide some content first!", "error");
    setGenerating(`improve_${fieldPath}`);
    try {
      const { data } = await axios.post("/api/ai/improve-content", { content });
      setValue(fieldPath, data.data.improvedContent);
      showMessage("Content polished!", "success");
    } catch (error) {
      console.error("AI failed", error);
      showMessage("Failed to polish content", "error");
    } finally {
      setGenerating(null);
    }
  };

  const checkAtsScore = async () => {
    const resumeElement = document.getElementById("resume-preview");
    if (!resumeElement) return;
    setGenerating("ats");
    try {
      const { data } = await axios.post("/api/ai/ats-score", { resumeText: resumeElement.innerText });
      setAtsScoreData(data.data.AtsScore);
      setShowAtsModal(true);
    } catch (error) {
      console.error("ATS check failed", error);
      showMessage("Failed to calculate ATS score", "error");
    } finally {
      setGenerating(null);
    }
  };



  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden print:block print:h-auto print:overflow-visible">
      
      {/* LEFT COLUMN: THE FORM */}
      <div className="w-[55%] flex flex-col bg-white border-r shadow-lg overflow-y-auto print:hidden relative">
        {/* Toast Message */}
        {message.text && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md text-white font-medium z-50 ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
            {message.text}
          </div>
        )}

        <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-20">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">
            <ArrowLeft size={16} className="mr-1" /> Dashboard
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={checkAtsScore}
              disabled={generating === "ats"}
              className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 font-medium transition disabled:opacity-50"
            >
              <Activity size={16} />
              {generating === "ats" ? "Analyzing..." : "ATS Check"}
            </button>
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
          {/* AI Configuration Area */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-4 items-center">
            <Sparkles className="text-indigo-500" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Target Experience Level</label>
              <select 
                value={experienceLevel} 
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full p-2 border-none bg-white rounded shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="Fresher">Fresher (0-1 years)</option>
                <option value="Junior">Junior (1-3 years)</option>
                <option value="Mid-Level">Mid-Level (3-6 years)</option>
                <option value="Senior">Senior (6+ years)</option>
              </select>
            </div>
            <div className="text-xs text-indigo-600 max-w-xs leading-relaxed">
              Set this level to guide the AI when generating summaries, skills, and descriptions tailored to your target role.
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Target Job Title (AI Context)</label>
            <input 
              id="title"
              {...register("title")} 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="e.g. Software Engineer, Product Manager"
            />
          </div>

          <hr />

          {/* Personal Details */}
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
              <div>
                <label className="block text-xs text-gray-500 mb-1">GitHub</label>
                <input {...register("personalInfo.github")} className="w-full p-2 border rounded" placeholder="github.com/johndoe" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Portfolio / LinkedIn</label>
                <input {...register("personalInfo.portfolio")} className="w-full p-2 border rounded" placeholder="linkedin.com/in/johndoe" />
              </div>
            </div>
          </div>

          <hr />

          {/* Professional Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Professional Summary</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => improveContent("summary", liveData.summary)}
                  disabled={generating === "improve_summary"}
                  className="text-xs flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-bold disabled:opacity-50 transition"
                >
                  <Wand2 size={12} /> {generating === "improve_summary" ? "Polishing..." : "Polish"}
                </button>
                <button
                  type="button"
                  onClick={generateAISummary}
                  disabled={generating === "summary"}
                  className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-bold disabled:opacity-50 transition"
                >
                  <Sparkles size={12} /> {generating === "summary" ? "Generating..." : "Generate AI"}
                </button>
              </div>
            </div>
            <textarea 
              {...register("summary")} 
              rows={4}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="Briefly describe your professional background, or click Generate AI!"
            />
          </div>

          <hr />

          {/* Skills */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Skills</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => improveContent("skills", liveData.skills)}
                  disabled={generating === "improve_skills"}
                  className="text-xs flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-bold disabled:opacity-50 transition"
                >
                  <Wand2 size={12} /> {generating === "improve_skills" ? "Polishing..." : "Polish"}
                </button>
                <button
                  type="button"
                  onClick={generateAISkills}
                  disabled={generating === "skills"}
                  className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-bold disabled:opacity-50 transition"
                >
                  <Sparkles size={12} /> {generating === "skills" ? "Generating..." : "Auto-Generate"}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">Comma separated (e.g. JavaScript, React, Node.js)</p>
            <input 
              {...register("skills")}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="React, TypeScript, Next.js..."
            />
          </div>

          <hr />

          {/* Experience */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Experience</label>
              <button type="button" onClick={() => appendExp({ company: "", position: "", startDate: "", endDate: "", description: "" })} className="text-sm flex items-center text-indigo-600 font-medium">
                <Plus size={16} /> Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-5 border rounded-xl relative bg-gray-50 shadow-sm">
                  <button type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Company</label>
                      <input {...register(`experience.${index}.company` as const)} className="w-full p-2 border rounded" placeholder="Company Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Position</label>
                      <input {...register(`experience.${index}.position` as const)} className="w-full p-2 border rounded" placeholder="Job Title" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input {...register(`experience.${index}.startDate` as const)} className="w-full p-2 border rounded" placeholder="MM/YYYY" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input {...register(`experience.${index}.endDate` as const)} className="w-full p-2 border rounded" placeholder="MM/YYYY or Present" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-gray-500">Description</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => improveContent(`experience.${index}.description`, liveData.experience[index]?.description)} disabled={generating === `improve_experience.${index}.description`} className="text-[10px] flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium disabled:opacity-50">
                          <Wand2 size={10} /> Polish
                        </button>
                        <button type="button" onClick={() => generateAIExperience(index)} disabled={generating === `exp_${index}`} className="text-[10px] flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium disabled:opacity-50">
                          <Sparkles size={10} /> Generate AI
                        </button>
                      </div>
                    </div>
                    <Controller
                      name={`experience.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Describe responsibilities and achievements... (Use formatting!)"
                        />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr />

          {/* Projects */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Projects</label>
              <button type="button" onClick={() => appendProj({ title: "", description: "", techStack: "", githubUrl: "", liveUrl: "" })} className="text-sm flex items-center text-indigo-600 font-medium">
                <Plus size={16} /> Add Project
              </button>
            </div>
            <div className="space-y-4">
              {projFields.map((field, index) => (
                <div key={field.id} className="p-5 border rounded-xl relative bg-gray-50 shadow-sm">
                  <button type="button" onClick={() => removeProj(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Project Title</label>
                      <input {...register(`projects.${index}.title` as const)} className="w-full p-2 border rounded" placeholder="Project Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tech Stack (comma separated)</label>
                      <input {...register(`projects.${index}.techStack` as const)} className="w-full p-2 border rounded" placeholder="React, Node.js" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">GitHub URL</label>
                      <input {...register(`projects.${index}.githubUrl` as const)} className="w-full p-2 border rounded" placeholder="github.com/..." />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Live URL</label>
                      <input {...register(`projects.${index}.liveUrl` as const)} className="w-full p-2 border rounded" placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-gray-500">Description</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => improveContent(`projects.${index}.description`, liveData.projects[index]?.description)} disabled={generating === `improve_projects.${index}.description`} className="text-[10px] flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium disabled:opacity-50">
                          <Wand2 size={10} /> Polish
                        </button>
                        <button type="button" onClick={() => generateAIProject(index)} disabled={generating === `proj_${index}`} className="text-[10px] flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium disabled:opacity-50">
                          <Sparkles size={10} /> Generate AI
                        </button>
                      </div>
                    </div>
                    <textarea {...register(`projects.${index}.description` as const)} className="w-full p-2 border rounded" rows={3} placeholder="Describe project features and impact..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr />

          {/* Education */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Education</label>
              <button type="button" onClick={() => appendEdu({ school: "", degree: "", startDate: "", endDate: "" })} className="text-sm flex items-center text-indigo-600 font-medium">
                <Plus size={16} /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded relative bg-gray-50 shadow-sm">
                  <button type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-2 pr-8">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">School / University</label>
                      <input {...register(`education.${index}.school` as const)} className="w-full p-2 border rounded" placeholder="University Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Degree</label>
                      <input {...register(`education.${index}.degree` as const)} className="w-full p-2 border rounded" placeholder="B.S. Computer Science" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input {...register(`education.${index}.startDate` as const)} className="w-full p-2 border rounded" placeholder="YYYY" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input {...register(`education.${index}.endDate` as const)} className="w-full p-2 border rounded" placeholder="YYYY or Present" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr />

          {/* Certifications */}
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Certifications</label>
            <p className="text-xs text-gray-500 mb-2">Comma separated (e.g. AWS Certified Solutions Architect, PMP)</p>
            <input 
              {...register("certifications")}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500" 
              placeholder="Add your certifications..."
            />
          </div>

          <div className="h-20"></div>

        </div>
      </div>

      {/* RIGHT COLUMN: THE LIVE PREVIEW */}
      <div ref={containerRef} className="w-[45%] p-8 overflow-y-auto bg-gray-200 flex justify-center print:w-full print:bg-white print:p-0 print:block print:overflow-visible">
        
        <div 
          id="resume-preview" 
          className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 print:shadow-none print:!transform-none print:!m-0 text-gray-800 text-[13px] leading-relaxed transition-transform duration-200"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          
          <div className="border-b-[1.5px] border-gray-400 pb-4 mb-5 text-center">
            <h1 className="text-3xl font-serif tracking-wide text-gray-900">
              {liveData?.personalInfo?.fullName || "Your Name"}
            </h1>
            {liveData?.title && <h2 className="text-md text-indigo-700 mt-1 uppercase tracking-widest">{liveData.title}</h2>}
            
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-gray-600 text-[11px]">
              {liveData?.personalInfo?.email && <span>{liveData.personalInfo.email}</span>}
              {liveData?.personalInfo?.phone && <span>• {liveData.personalInfo.phone}</span>}
              {liveData?.personalInfo?.location && <span>• {liveData.personalInfo.location}</span>}
              {liveData?.personalInfo?.github && <span>• {liveData.personalInfo.github.replace("https://", "")}</span>}
              {liveData?.personalInfo?.portfolio && <span>• {liveData.personalInfo.portfolio.replace("https://", "")}</span>}
            </div>
          </div>

          {liveData?.summary && (
            <div className="mb-5">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-2 border-b-[1.5px] border-gray-400 pb-1 text-gray-900">Professional Summary</h2>
              <p className="whitespace-pre-wrap">
                {liveData.summary}
              </p>
            </div>
          )}

          {liveData?.experience && liveData.experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-3 border-b-[1.5px] border-gray-400 pb-1 text-gray-900">Experience</h2>
              <div className="space-y-4">
                {liveData.experience.map((exp: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{exp.position} {exp.company && `| ${exp.company}`}</span>
                      <span className="font-medium text-gray-600">{exp.startDate} {exp.startDate && exp.endDate && "-"} {exp.endDate}</span>
                    </div>
                    {exp.description && (
                      <div 
                        className="mt-1.5 prose prose-sm prose-p:my-1 prose-ul:my-1 prose-ul:pl-4 max-w-none text-gray-800 text-[13px] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.projects && liveData.projects.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-3 border-b-[1.5px] border-gray-400 pb-1 text-gray-900">Projects</h2>
              <div className="space-y-4">
                {liveData.projects.map((proj: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{proj.title}</span>
                      <div className="flex gap-2 font-medium text-gray-600 text-[11px]">
                        {proj.githubUrl && <a href={proj.githubUrl} className="hover:underline" target="_blank">GitHub</a>}
                        {proj.githubUrl && proj.liveUrl && <span>|</span>}
                        {proj.liveUrl && <a href={proj.liveUrl} className="hover:underline" target="_blank">Live</a>}
                      </div>
                    </div>
                    {proj.techStack && (
                      <div className="text-[11px] text-indigo-700 font-medium mb-1.5">{proj.techStack}</div>
                    )}
                    {proj.description && (
                      <p className="whitespace-pre-wrap">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.education && liveData.education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-3 border-b-[1.5px] border-gray-400 pb-1 text-gray-900">Education</h2>
              <div className="space-y-3">
                {liveData.education.map((edu: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{edu.school}</span>
                      {edu.degree && <span>, {edu.degree}</span>}
                    </div>
                    <span className="font-medium text-gray-600">{edu.startDate} {edu.startDate && edu.endDate && "-"} {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.skills && liveData.skills.trim() && (
            <div className="mb-5">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-2 border-b-[1.5px] border-gray-400 pb-1 text-gray-900">Skills</h2>
              <p className="leading-relaxed">
                {liveData.skills}
              </p>
            </div>
          )}

          {liveData?.certifications && liveData.certifications.trim() && (
            <div className="mb-5">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-2 border-b-[1.5px] border-gray-400 pb-1 text-gray-900">Certifications</h2>
              <p className="leading-relaxed">
                {liveData.certifications}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ATS Score Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setShowAtsModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Activity className="text-purple-600" /> ATS Analysis Report
            </h2>
            
            {atsScoreData ? (
              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-6 bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 font-bold text-3xl"
                    style={{
                      borderColor: atsScoreData.atsScore >= 80 ? "#22c55e" : atsScoreData.atsScore >= 60 ? "#eab308" : "#ef4444",
                      color: atsScoreData.atsScore >= 80 ? "#16a34a" : atsScoreData.atsScore >= 60 ? "#ca8a04" : "#dc2626"
                    }}>
                    {atsScoreData.atsScore}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Overall Score</h3>
                    <p className="text-gray-600 text-sm">{atsScoreData.summary}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {atsScoreData.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 bg-green-50 p-2 rounded">{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" /> Needs Improvement
                    </h4>
                    <ul className="space-y-2">
                      {atsScoreData.improvements?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 bg-orange-50 p-2 rounded">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" /> AI Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {atsScoreData.recommendations?.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-red-500">Failed to load ATS data. Please try again.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}