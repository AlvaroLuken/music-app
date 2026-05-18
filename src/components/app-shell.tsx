"use client";

import { AudioLines, Guitar, Music2 } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Tuner } from "./tuner";

type InstrumentId = "guitar" | "bass";

const instruments: { id: InstrumentId; label: string; icon: typeof Guitar }[] = [
  { id: "guitar", label: "Guitar", icon: Guitar },
  { id: "bass", label: "Bass", icon: Music2 },
];

export function AppShell() {
  const [instrument, setInstrument] = useState<InstrumentId>("guitar");

  return (
    <main className="min-h-[100dvh] bg-[#f5f2ea] text-stone-950 selection:bg-amber-300 selection:text-stone-950 dark:bg-[#171512] dark:text-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-950/10 bg-[#f5f2ea]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#171512]/90">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-stone-950 shadow-sm shadow-amber-900/10">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500 dark:text-stone-400">Online tuner</p>
              <h1 className="text-lg font-semibold tracking-tight">Plain Tuner</h1>
            </div>
          </div>

          <nav aria-label="Instrument" className="ml-auto flex rounded-full border border-stone-950/10 bg-white/55 p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            {instruments.map((item) => {
              const Icon = item.icon;
              const isSelected = instrument === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInstrument(item.id)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition active:scale-[0.98] md:px-4 ${
                    isSelected
                      ? "bg-stone-950 text-white shadow-sm dark:bg-amber-300 dark:text-stone-950"
                      : "text-stone-600 hover:bg-stone-950/[0.06] dark:text-stone-300 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <Tuner presetId={instrument} />
    </main>
  );
}
