"use client";

import { Search } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-outline-variant w-full px-10 py-4 justify-end items-center">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input 
            type="text" 
            placeholder="Search resumes..." 
            className="pl-10 pr-4 py-2 bg-surface border-none rounded-lg focus:ring-2 focus:ring-primary/20 w-64 text-sm font-body outline-none"
          />
        </div>
        
        <button className="text-on-surface-variant hover:text-primary transition-opacity font-body text-sm font-medium">
          Support
        </button>
        
        <button 
          onClick={handleLogout}
          className="text-on-surface-variant hover:text-error transition-opacity font-body text-sm font-medium"
        >
          Logout
        </button>
        
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-outline-variant bg-surface flex items-center justify-center">
          <span className="font-headline font-bold text-primary">ME</span>
        </div>
      </div>
    </nav>
  );
}
