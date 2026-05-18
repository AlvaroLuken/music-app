"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { centsOff, frequencyToNote } from "@/lib/music";
import { autoCorrelate, INSTRUMENT_PRESETS, resolveInstrumentFrequency } from "@/lib/tuner";

type TunerProps = {
  presetId: "guitar" | "bass";
};

export function Tuner({ presetId }: TunerProps) {
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [frequency, setFrequency] = useState<number | null>(null);
  const [signalSamples, setSignalSamples] = useState<number[]>(Array.from({ length: 48 }, () => 0));
  const [signalLevel, setSignalLevel] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);
  const preset = INSTRUMENT_PRESETS.find((item) => item.id === presetId) ?? INSTRUMENT_PRESETS[1];
  const pitch = frequency ? frequencyToNote(frequency) : null;
  const stringTarget = frequency && preset.strings.length
    ? preset.strings.reduce((nearest, current) => Math.abs(current.frequency - frequency) < Math.abs(nearest.frequency - frequency) ? current : nearest)
    : null;
  const cents = stringTarget && frequency ? centsOff(frequency, stringTarget.frequency) : (pitch?.cents ?? 0);
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const noteName = stringTarget?.note ?? pitch?.note ?? "—";
  const noteDetail = stringTarget?.label.replace(stringTarget.note, "") ?? pitch?.octave ?? "";
  const isInTune = Boolean(frequency && Math.abs(cents) <= 4);
  const waveOffset = frequency ? clampedCents * 0.45 : 0;
  const waveColor = isInTune ? "rgb(16 185 129)" : cents < 0 ? "rgb(245 158 11)" : "rgb(251 113 133)";
  const wavePath = signalSamples
    .map((sample, index) => {
      const x = (index / Math.max(1, signalSamples.length - 1)) * 100;
      const y = 50 - Math.max(-1, Math.min(1, sample)) * 38 * Math.max(0.16, signalLevel);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

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
      setSignalSamples(Array.from({ length: 48 }, () => 0));
      setSignalLevel(0);
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
      analyser.fftSize = presetId === "bass" ? 16384 : 4096;
      analyser.smoothingTimeConstant = presetId === "bass" ? 0.2 : 0.8;
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
      let rms = 0;
      for (const sample of buffer) rms += sample * sample;
      setSignalLevel(Math.min(1, Math.sqrt(rms / buffer.length) * 8));
      const stride = Math.max(1, Math.floor(buffer.length / 48));
      setSignalSamples(Array.from({ length: 48 }, (_, index) => buffer[Math.min(buffer.length - 1, index * stride)] ?? 0));
      const detected = autoCorrelate(buffer, audio.sampleRate);
      if (detected) {
        const resolved = resolveInstrumentFrequency(detected, preset);
        if (resolved >= preset.range[0] && resolved <= preset.range[1]) setFrequency(resolved);
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running, preset]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopMedia(false);
    };
  }, []);

  let status = "Play a string";
  if (frequency && isInTune) status = "In tune";
  if (frequency && !isInTune) status = cents > 0 ? "Tune down" : "Tune up";

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-73px)] max-w-5xl items-center px-4 py-5 md:px-6 md:py-8">
      <div className="w-full overflow-hidden rounded-[2rem] border border-stone-950/10 bg-white/70 shadow-xl shadow-stone-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
        {error && <div className="m-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-100 md:mx-7">{error}</div>}

        <div className="p-4 md:p-7">
          <div className="rounded-[1.75rem] border border-stone-950/10 bg-[#f9f6ee] p-5 text-center dark:border-white/10 dark:bg-[#11100e] md:p-8">
            <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between text-xs uppercase tracking-[0.25em] text-stone-500">
              <span>Flat</span>
              <span className={isInTune ? "text-emerald-700 dark:text-emerald-300" : "text-stone-500"}>Perfect</span>
              <span>Sharp</span>
            </div>
            <div className="relative mx-auto h-48 max-w-2xl overflow-hidden rounded-t-full border border-stone-950/10 bg-gradient-to-b from-stone-950/[0.06] to-transparent dark:border-white/10 dark:from-white/[0.08] md:h-56">
              <div className="absolute bottom-0 left-[14%] h-10 w-px rotate-[-45deg] bg-stone-950/15 dark:bg-white/15" />
              <div className="absolute bottom-0 left-[28%] h-14 w-px rotate-[-28deg] bg-stone-950/20 dark:bg-white/20" />
              <div className="absolute bottom-0 left-1/2 h-full w-px bg-stone-950/20 dark:bg-white/20" />
              <div className="absolute bottom-0 right-[28%] h-14 w-px rotate-[28deg] bg-stone-950/20 dark:bg-white/20" />
              <div className="absolute bottom-0 right-[14%] h-10 w-px rotate-[45deg] bg-stone-950/15 dark:bg-white/15" />
              <div className={`absolute bottom-0 left-1/2 h-44 w-1 origin-bottom rounded-full transition-transform duration-100 md:h-52 ${isInTune ? "bg-emerald-500 dark:bg-emerald-300" : "bg-amber-400"}`} style={{ transform: `translateX(-50%) rotate(${clampedCents * 1.25}deg)` }} />
              <div className={`absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full ${isInTune ? "bg-emerald-500 dark:bg-emerald-300" : "bg-amber-400"}`} />
            </div>
            <div className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-3xl border border-stone-950/10 bg-white/60 p-4 text-left shadow-inner shadow-stone-950/[0.03] dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-3 flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400">
                <span>Flat</span>
                <span className={isInTune ? "text-emerald-700 dark:text-emerald-300" : "text-stone-500 dark:text-stone-400"}>Signal lock</span>
                <span>Sharp</span>
              </div>
              <div className="relative h-24 overflow-hidden rounded-2xl bg-stone-950/[0.04] dark:bg-black/20">
                <div className="absolute inset-y-0 left-1/2 w-px bg-stone-950/25 dark:bg-white/25" />
                <div className={`absolute inset-y-3 left-1/2 w-20 -translate-x-1/2 rounded-full blur-2xl transition-opacity ${isInTune ? "bg-emerald-400/45 opacity-100" : "bg-amber-300/30 opacity-60"}`} />
                <div className="absolute inset-x-0 top-1/2 h-px bg-stone-950/10 dark:bg-white/10" />
                <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M 0 50 L 100 50" fill="none" stroke="currentColor" strokeDasharray="1 6" strokeLinecap="round" className="text-stone-950/20 dark:text-white/20" />
                  <g transform={`translate(${waveOffset.toFixed(2)} 0)`} style={{ transition: "transform 120ms ease-out" }}>
                    <path d={wavePath} fill="none" stroke={waveColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" opacity={running ? 0.95 : 0.35} vectorEffect="non-scaling-stroke" />
                    <path d={wavePath} fill="none" stroke={waveColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" opacity={running ? 0.16 : 0.08} vectorEffect="non-scaling-stroke" />
                  </g>
                </svg>
                <div className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${isInTune ? "border-emerald-500 bg-emerald-300" : "border-amber-400 bg-[#f9f6ee] dark:bg-[#11100e]"}`} />
              </div>
              <p className="mt-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                {frequency ? "Wave centers when the note is locked." : "Start the mic and play a steady note."}
              </p>
            </div>
            <div className="mt-8 flex items-end justify-center gap-3">
              <span className="text-8xl font-bold tracking-tighter md:text-9xl">{noteName}</span>
              <span className="mb-4 text-3xl text-stone-500">{noteDetail}</span>
            </div>
            <p className={`mt-3 text-2xl font-semibold ${isInTune ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{status}</p>
            <p className="mt-2 font-mono text-stone-500">{frequency ? `${frequency.toFixed(2)} Hz · ${cents > 0 ? "+" : ""}${cents} cents` : "Waiting for signal"}</p>
            <button disabled={starting} onClick={running ? stop : start} className={`mx-auto mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${running ? "bg-stone-950 text-white dark:bg-red-400 dark:text-stone-950" : "bg-amber-300 text-stone-950 hover:bg-amber-200"}`}>
              {running ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {running ? "Stop" : starting ? "Starting" : "Use microphone"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
