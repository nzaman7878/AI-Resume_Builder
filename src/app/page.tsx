import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface overflow-hidden selection:bg-primary/20">
      
      {/* Navbar (Landing Page Specific) */}
      <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl leading-none">CA</span>
          </div>
          <span className="font-headline font-bold text-xl text-on-surface">Career Architect</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/auth/login" className="font-body font-semibold text-sm text-on-surface hover:text-primary transition-colors">
            Log in
          </Link>
          <Link 
            href="/auth/register" 
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 z-10">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary-container/40 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-outline-variant shadow-sm mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">AI-Powered Resume Builder</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface max-w-5xl leading-[1.1]">
          Architect the career <br className="hidden md:block" />
          you <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-fixed-variant">actually deserve.</span>
        </h1>
        
        <p className="mt-8 text-xl text-on-surface-variant font-body max-w-2xl leading-relaxed">
          The only resume builder that uses advanced AI to analyze top-tier job postings and craft the perfect profile for you in minutes.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/register"
            className="group flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 transition-all active:scale-95"
          >
            Build your resume now
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg text-on-surface bg-white border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            View Demo
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">AI Intelligence</h3>
            <p className="text-on-surface-variant leading-relaxed">We automatically polish your bullet points to match exactly what hiring managers are looking for.</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Instant ATS Check</h3>
            <p className="text-on-surface-variant leading-relaxed">Get real-time feedback on your Applicant Tracking System score before you even download the PDF.</p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Studio Quality</h3>
            <p className="text-on-surface-variant leading-relaxed">Export beautiful, pixel-perfect PDFs that look like they were designed by a professional agency.</p>
          </div>
        </div>

      </div>
    </div>
  );
}