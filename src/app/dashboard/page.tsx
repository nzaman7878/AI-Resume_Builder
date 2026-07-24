"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Eye, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchResumes = async () => {
    try {
      const { data } = await axios.get("/api/resume");
      setResumes(data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const createResume = async () => {
    try {
      const { data } = await axios.post("/api/resume", { title: "My New Resume" });
      router.push(`/resume/${data._id}`);
    } catch (error) {
      console.error("Failed to create resume", error);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axios.delete(`/api/resume/${id}`);
      fetchResumes();
    } catch (error) {
      console.error("Failed to delete resume", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-12">
        <h2 className="font-headline text-4xl font-semibold text-on-surface mb-2">Your Resumes</h2>
        <p className="font-body text-lg text-on-surface-variant">Manage and optimize your professional profiles.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Resume Card */}
        <button 
          onClick={createResume}
          className="group relative h-full flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 min-h-[360px]"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
            <Plus className="text-primary w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-headline text-xl text-on-surface mb-1 font-semibold">Create New</h3>
            <p className="text-sm font-body text-on-surface-variant">Start from scratch or AI-generate</p>
          </div>
        </button>

        {/* Existing Resumes */}
        {resumes.map((resume) => (
          <div 
            key={resume._id} 
            className="glass-panel rounded-2xl overflow-hidden canvas-shadow group cursor-pointer hover:-translate-y-1 transition-transform duration-300 flex flex-col min-h-[360px]"
          >
            {/* Top Preview Area */}
            <div className="resume-preview-bg h-56 p-6 relative flex items-start justify-center overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary/10 text-primary-container px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md border border-primary/10">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Optimized</span>
              </div>
              
              {/* Minimalist Resume Sketch Mockup */}
              <div className="w-full h-full bg-surface-bright rounded-t-lg shadow-2xl p-4 flex flex-col gap-2 translate-y-4 group-hover:translate-y-2 transition-transform duration-500 border border-outline-variant/30">
                <div className="h-4 w-1/2 bg-surface-dim rounded"></div>
                <div className="h-2 w-1/3 bg-surface-container rounded"></div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="h-2 w-full bg-surface-container rounded"></div>
                  <div className="h-2 w-full bg-surface-container rounded"></div>
                  <div className="h-2 w-3/4 bg-surface-container rounded"></div>
                </div>
              </div>
            </div>

            {/* Bottom Info Area */}
            <div className="p-6 bg-surface-bright flex-1 flex flex-col">
              <h4 className="font-body text-base font-semibold text-on-surface mb-1 truncate">{resume.title}</h4>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                Edited {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant/30">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container border-2 border-white flex items-center justify-center text-outline">
                    <Eye size={14} />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Link 
                    href={`/resume/${resume._id}`}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Open
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteResume(resume._id);
                    }}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Widget */}
      <section className="mt-16 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/50 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">AI Intelligence</span>
            </div>
            <h3 className="font-headline text-2xl text-on-surface mb-4 font-semibold">Optimize your impact</h3>
            <p className="text-sm font-body text-on-surface-variant mb-6 leading-relaxed">
              Our career architect AI analyzed 50,000+ top-tier job postings this week. Your resumes are matching high-salary leadership roles, but could use more quantifiable metrics.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
                Apply AI Fixes
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex w-72 h-48 bg-surface-bright/50 backdrop-blur-xl rounded-2xl border border-white p-6 shadow-xl flex-col justify-end gap-2">
            <div className="flex justify-between items-end h-full gap-2">
              <div className="bg-primary/20 w-full rounded-t-lg" style={{ height: "60%" }}></div>
              <div className="bg-primary/40 w-full rounded-t-lg" style={{ height: "45%" }}></div>
              <div className="bg-primary/60 w-full rounded-t-lg" style={{ height: "80%" }}></div>
              <div className="bg-primary w-full rounded-t-lg" style={{ height: "95%" }}></div>
              <div className="bg-primary/30 w-full rounded-t-lg" style={{ height: "50%" }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}