"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem("theme");
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "dark";
  } catch {
    return "dark";
  }
}

function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // Theme still applies for the current session if storage is unavailable.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => {
    const root = document.documentElement;
    storeTheme(theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => root.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm text-stone-300">
      {[
        ["light", Sun],
        ["dark", Moon],
        ["system", Monitor],
      ].map(([value, Icon]) => (
        <button
          key={value as string}
          type="button"
          onClick={() => setTheme(value as Theme)}
          className={`rounded-full px-3 py-2 transition ${theme === value ? "bg-amber-300 text-stone-950" : "hover:bg-white/10"}`}
          aria-label={`Use ${value} theme`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
