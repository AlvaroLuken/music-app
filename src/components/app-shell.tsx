"use client";

import { AudioLines, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Tuner } from "./tuner";

export function AppShell() {
  return (
    <main className="min-h-[100dvh] bg-[#f5f2ea] text-stone-950 selection:bg-amber-300 selection:text-stone-950 dark:bg-[#171512] dark:text-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-950/10 bg-[#f5f2ea]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#171512]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-stone-950 shadow-sm shadow-amber-900/10">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500 dark:text-stone-400">Online tuner</p>
              <h1 className="text-lg font-semibold tracking-tight">Plain Tuner</h1>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-2 rounded-full border border-stone-950/10 bg-white/55 px-3 py-2 text-sm text-stone-600 shadow-sm md:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            No ads. No account. No clutter.
          </div>
          <ThemeToggle />
        </div>
      </header>

      <Tuner />
    </main>
  );
}
