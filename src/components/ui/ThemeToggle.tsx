"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8 rounded-xl" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-xl transition-all duration-200 group"
      style={{
        backgroundColor: isDark ? "rgb(var(--foreground) / 0.06)" : "rgb(var(--foreground) / 0.06)",
        border: "1px solid rgb(var(--foreground) / 0.08)",
      }}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      <div className="relative w-4 h-4">
        <Sun className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-60 rotate-0 scale-100 group-hover:opacity-100"
        }`} style={{ color: "rgb(var(--foreground))" }} />
        <Moon className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
          isDark ? "opacity-60 rotate-0 scale-100 group-hover:opacity-100" : "opacity-0 -rotate-90 scale-50"
        }`} style={{ color: "rgb(var(--foreground))" }} />
      </div>
    </button>
  );
}
