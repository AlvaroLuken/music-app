"use client";

import { Music, Search, SlidersHorizontal, Star, Tally5, TimerReset } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { diagramFor } from "@/lib/chord-diagrams";
import { extractChords, parseChordProLine, preserveLyricSpacing, simplifyChart, transposeChart } from "@/lib/music";
import { searchSongs, songs, type Song } from "@/lib/songs";
import { Tuner } from "./tuner";
import { ThemeToggle } from "./theme-toggle";

type View = "chords" | "tuner";

function readStoredValue<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : fallback) as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked or full; the app should keep working without persistence.
  }
}

function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, fallback));
  useEffect(() => {
    writeStoredValue(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

function ChordToken({ chord }: { chord: string }) {
  const diagram = diagramFor(chord);
  return (
    <span className="group relative inline-block">
      <button className="rounded px-1.5 py-0.5 font-mono text-base font-bold text-amber-300 outline-none transition hover:bg-amber-300 hover:text-stone-950 focus-visible:bg-amber-300 focus-visible:text-stone-950">
        {chord}
      </button>
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-48 rounded-2xl border border-white/10 bg-stone-950 p-4 text-stone-100 shadow-2xl group-hover:block group-focus-within:block">
        {diagram ? <ChordGrid frets={diagram.frets} /> : <span className="text-sm text-stone-400">Diagram not seeded yet.</span>}
      </span>
    </span>
  );
}

function ChordGrid({ frets }: { frets: string }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-stone-500">Guitar</div>
      <div className="grid grid-cols-6 gap-1 border-t border-stone-500 pt-2">
        {frets.split("").map((fret, index) => (
          <div key={`${fret}-${index}`} className="flex flex-col items-center gap-1 text-xs text-stone-300">
            <span>{"EADGBE"[index]}</span>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${fret === "x" ? "text-stone-600" : fret === "0" ? "border border-stone-600" : "bg-amber-300 text-stone-950"}`}>
              {fret}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChordLine({ line }: { line: string }) {
  const segments = parseChordProLine(line);

  return (
    <div className="min-h-[3.2em] whitespace-nowrap leading-none">
      {segments.map((segment, index) => (
        <span key={`${segment.chord ?? "lyric"}-${index}`} className="inline-flex min-h-[3.1em] flex-col justify-end align-bottom">
          <span className="h-[1.25em] font-sans text-sm leading-none">
            {segment.chord ? <ChordToken chord={segment.chord} /> : null}
          </span>
          <span className="leading-[1.85]">{preserveLyricSpacing(segment.lyric)}</span>
        </span>
      ))}
    </div>
  );
}

function Chart({ song, transpose, simplified, fontSize }: { song: Song; transpose: number; simplified: boolean; fontSize: number }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const transformedSections = song.sections.map((section) => {
    const transposed = transposeChart(section.chart, transpose);
    return {
      ...section,
      chart: simplified ? simplifyChart(transposed) : transposed,
    };
  });
  const fullChart = transformedSections.map((section) => section.chart).join("\n");

  return (
    <div ref={chartRef} className="rounded-[2rem] border border-white/10 bg-stone-900/80 p-5 shadow-2xl shadow-black/20 md:p-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {extractChords(fullChart).map((chord) => (
          <span key={chord} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 font-mono text-sm text-amber-200">
            {chord}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max space-y-6 font-mono text-stone-100" style={{ fontSize }}>
          {transformedSections.map((section) => (
            <section key={section.name} className="space-y-1">
              <h3 className="font-sans text-sm uppercase tracking-[0.3em] text-stone-500">{section.name}</h3>
              <div className="space-y-1">
                {section.chart.split("\n").map((line, index) => <ChordLine key={`${section.name}-${index}`} line={line} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metronome({ bpm }: { bpm: number }) {
  const [enabled, setEnabled] = useState(false);
  const [beat, setBeat] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const interval = window.setInterval(() => setBeat((current) => !current), 60000 / bpm);
    return () => window.clearInterval(interval);
  }, [enabled, bpm]);
  return (
    <button onClick={() => setEnabled((current) => !current)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${enabled ? "bg-amber-300 text-stone-950" : "bg-white/10 text-stone-200 hover:bg-white/15"}`}>
      <Tally5 className={`h-4 w-4 ${beat ? "scale-125" : ""}`} /> {enabled ? `${bpm} BPM on` : `${bpm} BPM`}
    </button>
  );
}

export function AppShell() {
  const [view, setView] = useState<View>("chords");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(songs[0].id);
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [simplified, setSimplified] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(35);
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorite-songs", []);
  const [offline, setOffline] = useLocalStorage<string[]>("offline-songs", []);
  const results = useMemo(() => searchSongs(query), [query]);
  const song = songs.find((item) => item.id === selectedId) ?? songs[0];

  useEffect(() => {
    if (!autoScroll) return;
    const interval = window.setInterval(() => window.scrollBy({ top: 1 + scrollSpeed / 30, behavior: "smooth" }), 120);
    return () => window.clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  const toggleFavorite = () => setFavorites((current) => current.includes(song.id) ? current.filter((id) => id !== song.id) : [...current, song.id]);
  const toggleOffline = () => setOffline((current) => current.includes(song.id) ? current.filter((id) => id !== song.id) : [...current, song.id]);

  return (
    <main className="min-h-[100dvh] bg-stone-950 text-stone-50 selection:bg-amber-300 selection:text-stone-950 dark:bg-stone-950">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-stone-950"><Music className="h-5 w-5" /></div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">No ads. No login wall.</p>
              <h1 className="text-lg font-semibold">Music App</h1>
            </div>
          </div>
          <nav className="ml-auto inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button onClick={() => setView("chords")} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === "chords" ? "bg-stone-100 text-stone-950" : "text-stone-300 hover:bg-white/10"}`}>Chords</button>
            <button onClick={() => setView("tuner")} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === "tuner" ? "bg-stone-100 text-stone-950" : "text-stone-300 hover:bg-white/10"}`}>Tuner</button>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {view === "tuner" ? <Tuner /> : (
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:grid-cols-[360px_1fr] md:px-6">
          <aside className="space-y-4 md:sticky md:top-24 md:self-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              <label className="mb-2 block text-sm font-medium text-stone-300" htmlFor="song-search">Find a song</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-stone-900 px-3 py-3 focus-within:border-amber-300">
                <Search className="h-4 w-4 text-stone-500" />
                <input id="song-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, artist, key" className="w-full bg-transparent text-base outline-none placeholder:text-stone-600" />
              </div>
              <p className="mt-2 text-xs text-stone-500">Seed catalog only. External licensed chord source is intentionally not wired yet.</p>
            </section>
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
              {results.map((item) => (
                <button key={item.id} onClick={() => { setSelectedId(item.id); setTranspose(0); }} className={`block w-full border-b border-white/5 px-4 py-4 text-left transition last:border-0 ${item.id === song.id ? "bg-amber-300 text-stone-950" : "hover:bg-white/10"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <strong>{item.title}</strong>
                    {favorites.includes(item.id) && <Star className="h-4 w-4 fill-current" />}
                  </div>
                  <p className={`text-sm ${item.id === song.id ? "text-stone-800" : "text-stone-400"}`}>{item.artist} · {item.key} · {item.bpm} BPM</p>
                </button>
              ))}
            </section>
          </aside>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.3em] text-amber-300">{song.artist}</p>
                  <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{song.title}</h2>
                  <p className="mt-3 max-w-2xl text-stone-400">{song.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={toggleFavorite} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${favorites.includes(song.id) ? "bg-amber-300 text-stone-950" : "bg-white/10 hover:bg-white/15"}`}><Star className="h-4 w-4" /> Favorite</button>
                  <button onClick={toggleOffline} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">{offline.includes(song.id) ? "Cached" : "Save offline"}</button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-stone-950/50 p-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white/[0.04] p-3"><span className="text-xs uppercase tracking-[0.2em] text-stone-500">Transpose</span><div className="mt-2 flex items-center gap-2"><button onClick={() => setTranspose((n) => n - 1)} className="rounded-full bg-white/10 px-3 py-1">−</button><strong>{transpose > 0 ? `+${transpose}` : transpose}</strong><button onClick={() => setTranspose((n) => n + 1)} className="rounded-full bg-white/10 px-3 py-1">+</button></div></div>
                <div className="rounded-2xl bg-white/[0.04] p-3"><span className="text-xs uppercase tracking-[0.2em] text-stone-500">Capo</span><div className="mt-2 flex items-center gap-2"><button onClick={() => setCapo((n) => Math.max(0, n - 1))} className="rounded-full bg-white/10 px-3 py-1">−</button><strong>{capo}</strong><button onClick={() => setCapo((n) => Math.min(12, n + 1))} className="rounded-full bg-white/10 px-3 py-1">+</button></div></div>
                <div className="rounded-2xl bg-white/[0.04] p-3"><span className="text-xs uppercase tracking-[0.2em] text-stone-500">Font</span><input aria-label="Font size" type="range" min="16" max="26" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-3 w-full accent-amber-300" /></div>
                <div className="rounded-2xl bg-white/[0.04] p-3"><span className="text-xs uppercase tracking-[0.2em] text-stone-500">Play mode</span><div className="mt-2 flex flex-wrap gap-2"><button onClick={() => setSimplified((v) => !v)} className={`rounded-full px-3 py-1 text-sm ${simplified ? "bg-amber-300 text-stone-950" : "bg-white/10"}`}><SlidersHorizontal className="mr-1 inline h-3 w-3" /> Simplify</button><Metronome bpm={song.bpm} /></div></div>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-stone-950/50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => setAutoScroll((v) => !v)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${autoScroll ? "bg-amber-300 text-stone-950" : "bg-white/10 hover:bg-white/15"}`}><TimerReset className="h-4 w-4" /> Auto-scroll</button>
                  <input aria-label="Auto-scroll speed" type="range" min="5" max="80" value={scrollSpeed} onChange={(event) => setScrollSpeed(Number(event.target.value))} className="w-48 accent-amber-300" />
                  <div className="ml-auto flex flex-wrap gap-2 text-sm text-stone-400">{song.sections.map((section) => <span key={section.name} className="rounded-full border border-white/10 px-3 py-1">{section.name}</span>)}</div>
                </div>
              </div>
            </div>
            <Chart song={song} transpose={transpose - capo} simplified={simplified} fontSize={fontSize} />
            <p className="pb-10 text-sm text-stone-500">Capo changes shown chord shapes by subtracting capo from transpose. Favorites/offline saves are local to this browser for the MVP.</p>
          </section>
        </div>
      )}
    </main>
  );
}
