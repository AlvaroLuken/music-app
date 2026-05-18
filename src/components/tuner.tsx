"use client";

import { Gauge, Mic, MicOff, SignalHigh, SlidersHorizontal, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { centsOff, frequencyToNote } from "@/lib/music";
import { autoCorrelate, INSTRUMENT_PRESETS } from "@/lib/tuner";

export function Tuner() {
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [frequency, setFrequency] = useState<number | null>(null);
  const [presetId, setPresetId] = useState<"chromatic" | "guitar" | "bass">("guitar");
  const audioRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);
  const preset = INSTRUMENT_PRESETS.find((item) => item.id === presetId) ?? INSTRUMENT_PRESETS[0];
  const pitch = frequency ? frequencyToNote(frequency) : null;
  const stringTarget = frequency && preset.strings.length
    ? preset.strings.reduce((nearest, current) => Math.abs(current.frequency - frequency) < Math.abs(nearest.frequency - frequency) ? current : nearest)
    : null;
  const cents = stringTarget && frequency ? centsOff(frequency, stringTarget.frequency) : (pitch?.cents ?? 0);
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const noteName = stringTarget?.note ?? pitch?.note ?? "—";
  const noteDetail = stringTarget?.label.replace(stringTarget.note, "") ?? pitch?.octave ?? "";
  const isInTune = Boolean(frequency && Math.abs(cents) <= 4);

  function stopMedia(updateState = true) {
    requestIdRef.current += 1;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioRef.current?.close();
    streamRef.current = null;
    audioRef.current = null;
    analyserRef.current = null;
    if (updateState) {
      setRunning(false);
      setStarting(false);
      setFrequency(null);
    }
  }

  async function start() {
    if (starting || running) return;
    setStarting(true);
    setError("");
    stopMedia(false);
    const requestId = ++requestIdRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const audio = new AudioContext();
      const analyser = audio.createAnalyser();
      analyser.fftSize = 4096;
      audio.createMediaStreamSource(stream).connect(analyser);
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        void audio.close();
        return;
      }
      audioRef.current = audio;
      analyserRef.current = analyser;
      streamRef.current = stream;
      setRunning(true);
    } catch {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setError("Microphone permission is blocked. Allow mic access and use HTTPS or localhost.");
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) setStarting(false);
    }
  }

  function stop() {
    stopMedia(true);
  }

  useEffect(() => {
    if (!running || !analyserRef.current || !audioRef.current) return;
    const buffer = new Float32Array(analyserRef.current.fftSize);
    const tick = () => {
      const analyser = analyserRef.current;
      const audio = audioRef.current;
      if (!analyser || !audio) return;
      analyser.getFloatTimeDomainData(buffer);
      const detected = autoCorrelate(buffer, audio.sampleRate);
      if (detected && detected >= preset.range[0] && detected <= preset.range[1]) setFrequency(detected);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running, preset.range]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopMedia(false);
    };
  }, []);

  let status = "Play one open string";
  if (frequency && isInTune) status = "In tune";
  if (frequency && !isInTune) status = cents > 0 ? "Tune down" : "Tune up";

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[minmax(0,1fr)_340px] md:px-6 md:py-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="overflow-hidden rounded-[2rem] border border-stone-950/10 bg-white/70 shadow-xl shadow-stone-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-950/10 p-5 dark:border-white/10 md:p-7">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">Fast pitch detection</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">A tuner, nothing else.</h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">Open it, allow the mic, tune the instrument. No popups, subscriptions, fake lessons, or screen-filling ad slots.</p>
          </div>
          <button disabled={starting} onClick={running ? stop : start} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${running ? "bg-stone-950 text-white dark:bg-red-400 dark:text-stone-950" : "bg-amber-300 text-stone-950 hover:bg-amber-200"}`}>
            {running ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {running ? "Stop" : starting ? "Starting" : "Use microphone"}
          </button>
        </div>

        {error && <div className="m-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-100 md:mx-7">{error}</div>}

        <div className="p-4 md:p-7">
          <div className="rounded-[1.75rem] border border-stone-950/10 bg-[#f9f6ee] p-5 text-center dark:border-white/10 dark:bg-[#11100e] md:p-8">
            <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between text-xs uppercase tracking-[0.25em] text-stone-500">
              <span>Flat</span>
              <span className={isInTune ? "text-emerald-700 dark:text-emerald-300" : "text-stone-500"}>Perfect</span>
              <span>Sharp</span>
            </div>
            <div className="relative mx-auto h-48 max-w-2xl overflow-hidden rounded-t-full border border-stone-950/10 bg-gradient-to-b from-stone-950/[0.06] to-transparent dark:border-white/10 dark:from-white/[0.08]">
              <div className="absolute bottom-0 left-[14%] h-10 w-px rotate-[-45deg] bg-stone-950/15 dark:bg-white/15" />
              <div className="absolute bottom-0 left-[28%] h-14 w-px rotate-[-28deg] bg-stone-950/20 dark:bg-white/20" />
              <div className="absolute bottom-0 left-1/2 h-full w-px bg-stone-950/20 dark:bg-white/20" />
              <div className="absolute bottom-0 right-[28%] h-14 w-px rotate-[28deg] bg-stone-950/20 dark:bg-white/20" />
              <div className="absolute bottom-0 right-[14%] h-10 w-px rotate-[45deg] bg-stone-950/15 dark:bg-white/15" />
              <div className={`absolute bottom-0 left-1/2 h-44 w-1 origin-bottom rounded-full transition-transform duration-100 ${isInTune ? "bg-emerald-500 dark:bg-emerald-300" : "bg-amber-400"}`} style={{ transform: `translateX(-50%) rotate(${clampedCents * 1.25}deg)` }} />
              <div className={`absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full ${isInTune ? "bg-emerald-500 dark:bg-emerald-300" : "bg-amber-400"}`} />
            </div>
            <div className="mt-8 flex items-end justify-center gap-3">
              <span className="text-8xl font-bold tracking-tighter md:text-9xl">{noteName}</span>
              <span className="mb-4 text-3xl text-stone-500">{noteDetail}</span>
            </div>
            <p className={`mt-3 text-2xl font-semibold ${isInTune ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{status}</p>
            <p className="mt-2 font-mono text-stone-500">{frequency ? `${frequency.toFixed(2)} Hz · ${cents > 0 ? "+" : ""}${cents} cents` : "Waiting for signal"}</p>
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <section className="rounded-[2rem] border border-stone-950/10 bg-white/70 p-5 shadow-xl shadow-stone-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
          <div className="mb-4 flex items-center gap-2"><Gauge className="h-5 w-5 text-amber-600 dark:text-amber-300" /><h3 className="font-semibold">Instrument</h3></div>
          <div className="grid gap-2">
            {INSTRUMENT_PRESETS.map((item) => (
              <button key={item.id} onClick={() => setPresetId(item.id)} className={`rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] ${presetId === item.id ? "border-amber-300 bg-amber-300 text-stone-950" : "border-stone-950/10 bg-stone-950/[0.03] hover:bg-stone-950/[0.06] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10"}`}>
                <strong>{item.name}</strong>
                <p className={`text-sm ${presetId === item.id ? "text-stone-800" : "text-stone-500"}`}>{item.range[0]}-{item.range[1]} Hz</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-950/10 bg-white/70 p-5 shadow-xl shadow-stone-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
          <div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-amber-600 dark:text-amber-300" /><h3 className="font-semibold">Reference</h3></div>
          {preset.strings.length ? <div className="grid grid-cols-2 gap-2">{preset.strings.map((string) => <div key={string.label} className="rounded-2xl border border-stone-950/10 bg-[#f9f6ee] p-3 dark:border-white/10 dark:bg-[#11100e]"><strong>{string.label}</strong><p className="font-mono text-sm text-stone-500">{string.frequency.toFixed(2)} Hz</p></div>)}</div> : <p className="text-sm text-stone-500">Chromatic mode detects the nearest note across the full range.</p>}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] border border-stone-950/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <SignalHigh className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <p className="text-sm font-semibold">Real mic input</p>
            <p className="mt-1 text-xs text-stone-500">HTTPS or localhost.</p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-950/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <Zap className="mb-3 h-5 w-5 text-amber-600 dark:text-amber-300" />
            <p className="text-sm font-semibold">Low friction</p>
            <p className="mt-1 text-xs text-stone-500">No signup flow.</p>
          </div>
        </section>
      </aside>
    </section>
  );
}
