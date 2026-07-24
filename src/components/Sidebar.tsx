"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles,
  Settings,
  PencilRuler
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resumes", href: "/dashboard#", icon: FileText },
    { name: "Templates", href: "/dashboard#", icon: PencilRuler },
    { name: "AI Optimizer", href: "/dashboard#", icon: Sparkles },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-bright/80 backdrop-blur-xl border-r border-outline-variant shadow-sm flex-col py-6 px-4 z-50">
      <div className="mb-12 px-2">
        <Link href="/" className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">CA</span>
          </div>
          <h2 className="font-headline text-lg font-bold text-primary">Career Architect</h2>
        </Link>
        <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest px-1">Premium Tier</p>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group ${
                isActive 
                  ? "text-primary font-bold bg-primary-container/30" 
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              }`}
            >
              <Icon size={20} className={`transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
              <span className="font-body text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <Link href="/dashboard#" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors rounded-lg group">
          <Settings size={20} className="group-hover:rotate-45 transition-transform" />
          <span className="font-body text-sm">Settings</span>
        </Link>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
          <p className="text-on-surface font-semibold text-sm mb-1">Upgrade to Pro</p>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Unlock advanced AI analysis and unlimited exports.</p>
          <button className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
