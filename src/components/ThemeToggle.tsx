"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder of the same size
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {resolvedTheme === "dark" ? (
        <Sun size={20} className="fill-current" />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
