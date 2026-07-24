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
        const A4_WIDTH_PX = 794;
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

  const inputClass = "w-full p-3 rounded-xl border border-outline-variant bg-white text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-sm";
  const labelClass = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2";

  return (
    <div className="flex h-screen bg-surface overflow-hidden print:block print:h-auto print:overflow-visible">
      
      {/* LEFT COLUMN: THE FORM */}
      <div className="w-[55%] flex flex-col bg-surface-bright border-r border-outline-variant shadow-lg overflow-y-auto print:hidden relative hide-scrollbars">
        {/* Toast Message */}
        {message.text && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl shadow-md text-white font-medium z-50 text-sm ${message.type === "success" ? "bg-green-600" : "bg-error"}`}>
            {message.text}
          </div>
        )}

        <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-20">
          <Link href="/dashboard" className="flex items-center text-on-surface-variant hover:text-primary font-medium text-sm transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Dashboard
          </Link>
          
          <div className="flex gap-3">
            <button
              onClick={checkAtsScore}
              disabled={generating === "ats"}
              className="flex items-center gap-2 bg-primary-container text-primary px-4 py-2 rounded-xl hover:bg-primary-container/80 font-semibold text-sm transition disabled:opacity-50"
            >
              <Activity size={16} />
              {generating === "ats" ? "Analyzing..." : "ATS Check"}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-surface text-on-surface px-4 py-2 rounded-xl hover:bg-surface-container font-semibold text-sm transition border border-outline-variant"
            >
              <Download size={16} />
              PDF
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* AI Configuration Area */}
          <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex gap-5 items-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="text-primary w-6 h-6" />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Target Experience Level</label>
              <select 
                value={experienceLevel} 
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full p-2.5 border-none bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm font-semibold text-on-surface outline-none"
              >
                <option value="Fresher">Fresher (0-1 years)</option>
                <option value="Junior">Junior (1-3 years)</option>
                <option value="Mid-Level">Mid-Level (3-6 years)</option>
                <option value="Senior">Senior (6+ years)</option>
              </select>
            </div>
            <div className="text-xs text-on-surface-variant max-w-xs leading-relaxed font-medium">
              Set this level to guide the Career Architect AI when generating content tailored to your target role.
            </div>
          </div>

          <div>
            <label htmlFor="title" className={labelClass}>Target Job Title</label>
            <input 
              id="title"
              {...register("title")} 
              className={inputClass} 
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Personal Details */}
          <div>
            <label className={labelClass}>Personal Details</label>
            <div className="grid grid-cols-2 gap-5 mt-4">
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Full Name</label>
                <input {...register("personalInfo.fullName")} className={inputClass} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Email</label>
                <input {...register("personalInfo.email")} className={inputClass} placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Phone</label>
                <input {...register("personalInfo.phone")} className={inputClass} placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Location</label>
                <input {...register("personalInfo.location")} className={inputClass} placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1.5">GitHub URL</label>
                <input {...register("personalInfo.github")} className={inputClass} placeholder="github.com/janedoe" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Portfolio / LinkedIn</label>
                <input {...register("personalInfo.portfolio")} className={inputClass} placeholder="linkedin.com/in/janedoe" />
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Professional Summary */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className={labelClass + " mb-0"}>Professional Summary</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => improveContent("summary", liveData.summary)}
                  disabled={generating === "improve_summary"}
                  className="text-[11px] flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-low font-bold uppercase tracking-wider disabled:opacity-50 transition"
                >
                  <Wand2 size={12} /> {generating === "improve_summary" ? "Polishing..." : "Polish"}
                </button>
                <button
                  type="button"
                  onClick={generateAISummary}
                  disabled={generating === "summary"}
                  className="text-[11px] flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-bold uppercase tracking-wider disabled:opacity-50 transition"
                >
                  <Sparkles size={12} /> {generating === "summary" ? "Generating..." : "Auto-Generate"}
                </button>
              </div>
            </div>
            <textarea 
              {...register("summary")} 
              rows={4}
              className={inputClass} 
              placeholder="Briefly describe your professional background..."
            />
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Skills */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className={labelClass + " mb-0"}>Skills</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => improveContent("skills", liveData.skills)}
                  disabled={generating === "improve_skills"}
                  className="text-[11px] flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-low font-bold uppercase tracking-wider disabled:opacity-50 transition"
                >
                  <Wand2 size={12} /> {generating === "improve_skills" ? "Polishing..." : "Polish"}
                </button>
                <button
                  type="button"
                  onClick={generateAISkills}
                  disabled={generating === "skills"}
                  className="text-[11px] flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 font-bold uppercase tracking-wider disabled:opacity-50 transition"
                >
                  <Sparkles size={12} /> {generating === "skills" ? "Generating..." : "Auto-Generate"}
                </button>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">Comma separated (e.g. JavaScript, React, Node.js)</p>
            <input 
              {...register("skills")}
              className={inputClass} 
              placeholder="React, TypeScript, Next.js..."
            />
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Experience */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <label className={labelClass + " mb-0"}>Experience</label>
              <button type="button" onClick={() => appendExp({ company: "", position: "", startDate: "", endDate: "", description: "" })} className="text-[11px] flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors">
                <Plus size={14} /> Add Experience
              </button>
            </div>
            <div className="space-y-6">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-outline-variant rounded-2xl relative bg-surface-container-lowest shadow-sm">
                  <button type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-outline hover:text-error transition p-2 hover:bg-error/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-5 mb-5 pr-10">
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Company</label>
                      <input {...register(`experience.${index}.company` as const)} className={inputClass} placeholder="Acme Corp" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Position</label>
                      <input {...register(`experience.${index}.position` as const)} className={inputClass} placeholder="Senior Developer" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Start Date</label>
                      <input {...register(`experience.${index}.startDate` as const)} className={inputClass} placeholder="Jan 2020" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">End Date</label>
                      <input {...register(`experience.${index}.endDate` as const)} className={inputClass} placeholder="Present" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs text-on-surface-variant font-medium">Description</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => improveContent(`experience.${index}.description`, liveData.experience[index]?.description)} disabled={generating === `improve_experience.${index}.description`} className="text-[10px] flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline-variant px-2 py-1 rounded-md hover:bg-surface-container-low font-bold uppercase tracking-wider disabled:opacity-50 transition">
                          <Wand2 size={10} /> Polish
                        </button>
                        <button type="button" onClick={() => generateAIExperience(index)} disabled={generating === `exp_${index}`} className="text-[10px] flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 font-bold uppercase tracking-wider disabled:opacity-50 transition">
                          <Sparkles size={10} /> Generate AI
                        </button>
                      </div>
                    </div>
                    <Controller
                      name={`experience.${index}.description` as const}
                      control={control}
                      render={({ field }) => (
                         <div className="rounded-xl overflow-hidden border border-outline-variant">
                           <RichTextEditor
                             value={field.value || ""}
                             onChange={field.onChange}
                             placeholder="Describe responsibilities and achievements..."
                           />
                         </div>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Projects */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <label className={labelClass + " mb-0"}>Projects</label>
              <button type="button" onClick={() => appendProj({ title: "", description: "", techStack: "", githubUrl: "", liveUrl: "" })} className="text-[11px] flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors">
                <Plus size={14} /> Add Project
              </button>
            </div>
            <div className="space-y-6">
              {projFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-outline-variant rounded-2xl relative bg-surface-container-lowest shadow-sm">
                  <button type="button" onClick={() => removeProj(index)} className="absolute top-4 right-4 text-outline hover:text-error transition p-2 hover:bg-error/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-5 mb-5 pr-10">
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Project Title</label>
                      <input {...register(`projects.${index}.title` as const)} className={inputClass} placeholder="Project Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Tech Stack</label>
                      <input {...register(`projects.${index}.techStack` as const)} className={inputClass} placeholder="React, Node.js" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">GitHub URL</label>
                      <input {...register(`projects.${index}.githubUrl` as const)} className={inputClass} placeholder="github.com/..." />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Live URL</label>
                      <input {...register(`projects.${index}.liveUrl` as const)} className={inputClass} placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs text-on-surface-variant font-medium">Description</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => improveContent(`projects.${index}.description`, liveData.projects[index]?.description)} disabled={generating === `improve_projects.${index}.description`} className="text-[10px] flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline-variant px-2 py-1 rounded-md hover:bg-surface-container-low font-bold uppercase tracking-wider disabled:opacity-50 transition">
                          <Wand2 size={10} /> Polish
                        </button>
                        <button type="button" onClick={() => generateAIProject(index)} disabled={generating === `proj_${index}`} className="text-[10px] flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 font-bold uppercase tracking-wider disabled:opacity-50 transition">
                          <Sparkles size={10} /> Generate AI
                        </button>
                      </div>
                    </div>
                    <textarea {...register(`projects.${index}.description` as const)} className={inputClass} rows={3} placeholder="Describe project features and impact..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Education */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <label className={labelClass + " mb-0"}>Education</label>
              <button type="button" onClick={() => appendEdu({ school: "", degree: "", startDate: "", endDate: "" })} className="text-[11px] flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors">
                <Plus size={14} /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {eduFields.map((field, index) => (
                <div key={field.id} className="p-5 border border-outline-variant rounded-2xl relative bg-surface-container-lowest shadow-sm">
                  <button type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-outline hover:text-error transition p-2 hover:bg-error/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-5 pr-10">
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">School / University</label>
                      <input {...register(`education.${index}.school` as const)} className={inputClass} placeholder="University Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Degree</label>
                      <input {...register(`education.${index}.degree` as const)} className={inputClass} placeholder="B.S. Computer Science" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">Start Date</label>
                      <input {...register(`education.${index}.startDate` as const)} className={inputClass} placeholder="2018" />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant font-medium mb-1.5">End Date</label>
                      <input {...register(`education.${index}.endDate` as const)} className={inputClass} placeholder="2022" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          {/* Certifications */}
          <div>
            <label className={labelClass}>Certifications</label>
            <p className="text-xs text-on-surface-variant mb-3">Comma separated (e.g. AWS Certified, PMP)</p>
            <input 
              {...register("certifications")}
              className={inputClass} 
              placeholder="Add your certifications..."
            />
          </div>

          <div className="h-20"></div>

        </div>
      </div>

      {/* RIGHT COLUMN: THE LIVE PREVIEW */}
      <div ref={containerRef} className="w-[45%] p-8 overflow-y-auto bg-surface-dim flex justify-center print:w-full print:bg-white print:p-0 print:block print:overflow-visible hide-scrollbars items-start pt-12">
        
        <div 
          id="resume-preview" 
          className="bg-white w-[210mm] min-h-[297mm] canvas-shadow p-12 print:shadow-none print:!transform-none print:!m-0 text-on-surface font-body text-[13px] leading-relaxed transition-transform duration-200"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        >
          
          <div className="border-b-2 border-outline pb-6 mb-6 text-center">
            <h1 className="text-4xl font-headline font-semibold tracking-tight text-on-surface">
              {liveData?.personalInfo?.fullName || "Your Name"}
            </h1>
            {liveData?.title && <h2 className="text-sm font-headline text-primary mt-2 uppercase tracking-widest font-semibold">{liveData.title}</h2>}
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-on-surface-variant text-xs font-medium">
              {liveData?.personalInfo?.email && <span>{liveData.personalInfo.email}</span>}
              {liveData?.personalInfo?.phone && <span>• {liveData.personalInfo.phone}</span>}
              {liveData?.personalInfo?.location && <span>• {liveData.personalInfo.location}</span>}
              {liveData?.personalInfo?.github && <span>• {liveData.personalInfo.github.replace("https://", "")}</span>}
              {liveData?.personalInfo?.portfolio && <span>• {liveData.personalInfo.portfolio.replace("https://", "")}</span>}
            </div>
          </div>

          {liveData?.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-headline font-bold uppercase tracking-widest mb-3 text-on-surface">Professional Summary</h2>
              <p className="whitespace-pre-wrap text-on-surface-variant leading-loose">
                {liveData.summary}
              </p>
            </div>
          )}

          {liveData?.experience && liveData.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-headline font-bold uppercase tracking-widest mb-4 text-on-surface">Experience</h2>
              <div className="space-y-6">
                {liveData.experience.map((exp: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between font-bold text-on-surface mb-1">
                      <span className="text-sm">{exp.position} {exp.company && <span className="text-on-surface-variant font-normal">| {exp.company}</span>}</span>
                      <span className="text-xs font-semibold text-on-surface-variant">{exp.startDate} {exp.startDate && exp.endDate && "-"} {exp.endDate}</span>
                    </div>
                    {exp.description && (
                      <div 
                        className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-ul:pl-4 max-w-none text-on-surface-variant text-[13px] leading-loose"
                        dangerouslySetInnerHTML={{ __html: exp.description }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.projects && liveData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-headline font-bold uppercase tracking-widest mb-4 text-on-surface">Projects</h2>
              <div className="space-y-5">
                {liveData.projects.map((proj: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between font-bold text-on-surface mb-1">
                      <span className="text-sm">{proj.title}</span>
                      <div className="flex gap-2 font-semibold text-on-surface-variant text-xs">
                        {proj.githubUrl && <a href={proj.githubUrl} className="hover:text-primary transition-colors" target="_blank">GitHub</a>}
                        {proj.githubUrl && proj.liveUrl && <span>|</span>}
                        {proj.liveUrl && <a href={proj.liveUrl} className="hover:text-primary transition-colors" target="_blank">Live</a>}
                      </div>
                    </div>
                    {proj.techStack && (
                      <div className="text-xs text-primary font-semibold mb-2">{proj.techStack}</div>
                    )}
                    {proj.description && (
                      <p className="whitespace-pre-wrap text-on-surface-variant leading-loose">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.education && liveData.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-headline font-bold uppercase tracking-widest mb-4 text-on-surface">Education</h2>
              <div className="space-y-4">
                {liveData.education.map((edu: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-bold text-on-surface text-sm">{edu.school}</span>
                      {edu.degree && <span className="text-on-surface-variant text-sm">, {edu.degree}</span>}
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant">{edu.startDate} {edu.startDate && edu.endDate && "-"} {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveData?.skills && liveData.skills.trim() && (
            <div className="mb-6">
              <h2 className="text-sm font-headline font-bold uppercase tracking-widest mb-3 text-on-surface">Skills</h2>
              <p className="leading-loose text-on-surface-variant">
                {liveData.skills}
              </p>
            </div>
          )}

          {liveData?.certifications && liveData.certifications.trim() && (
            <div className="mb-6">
              <h2 className="text-sm font-headline font-bold uppercase tracking-widest mb-3 text-on-surface">Certifications</h2>
              <p className="leading-loose text-on-surface-variant">
                {liveData.certifications}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ATS Score Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-surface-bright rounded-[24px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-outline-variant">
            <button onClick={() => setShowAtsModal(false)} className="absolute top-6 right-6 text-outline hover:text-on-surface transition">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 flex items-center gap-3">
              <Activity className="text-primary" /> ATS Analysis Report
            </h2>
            
            {atsScoreData ? (
              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-6 bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-[6px] font-headline font-bold text-3xl shadow-sm"
                    style={{
                      borderColor: atsScoreData.atsScore >= 80 ? "#22c55e" : atsScoreData.atsScore >= 60 ? "#eab308" : "#ef4444",
                      color: atsScoreData.atsScore >= 80 ? "#16a34a" : atsScoreData.atsScore >= 60 ? "#ca8a04" : "#dc2626"
                    }}>
                    {atsScoreData.atsScore}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline font-bold text-xl text-on-surface mb-1">Overall Score</h3>
                    <p className="text-on-surface-variant text-sm font-body leading-relaxed">{atsScoreData.summary}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-outline-variant shadow-sm">
                    <h4 className="font-headline font-bold text-green-700 mb-4 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {atsScoreData.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-sm font-body text-on-surface-variant bg-green-50/50 p-2.5 rounded-lg">{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-outline-variant shadow-sm">
                    <h4 className="font-headline font-bold text-orange-700 mb-4 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Needs Improvement
                    </h4>
                    <ul className="space-y-2">
                      {atsScoreData.improvements?.map((s: string, i: number) => (
                        <li key={i} className="text-sm font-body text-on-surface-variant bg-orange-50/50 p-2.5 rounded-lg">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                  <h4 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" /> AI Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {atsScoreData.recommendations?.map((s: string, i: number) => (
                      <li key={i} className="text-sm font-body text-on-surface-variant bg-primary/5 p-3.5 rounded-xl border border-primary/10 leading-relaxed">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-error font-medium">Failed to load ATS data. Please try again.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}