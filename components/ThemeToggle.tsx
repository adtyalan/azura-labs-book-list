"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Jalankan efek saat client-side hydration selesai
  useEffect(() => {
    // Ambil tema yang disimpan di localStorage atau default ke sistem preferensi
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle shadow-sm border border-base-200 bg-base-100 hover:bg-base-200 transition-colors"
      aria-label="Toggle Theme"
      type="button"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700 fill-slate-700/10" />
      ) : (
        <Sun className="w-5 h-5 text-warning" />
      )}
    </button>
  );
}
