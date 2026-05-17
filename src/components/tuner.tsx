"use client";

import { Gauge, Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { centsOff, frequencyToNote } from "@/lib/music";
import { autoCorrelate, INSTRUMENT_PRESETS, nearestString } from "@/lib/tuner";

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
  const stringTarget = frequency ? nearestString(frequency, preset) : null;
  const cents = stringTarget && frequency ? centsOff(frequency, stringTarget.frequency) : (pitch?.cents ?? 0);
  const clampedCents = Math.max(-50, Math.min(50, cents));

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
  if (frequency && Math.abs(cents) <= 4) status = "In tune";
  if (frequency && Math.abs(cents) > 4) status = cents > 0 ? "Tune down" : "Tune up";

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1fr_380px] md:px-6">
      <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-amber-300">Real-time chromatic tuner</p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Tune fast, then play.</h2>
            <p className="mt-3 max-w-2xl text-stone-400">Web Audio microphone input, autocorrelation pitch detection, guitar and bass ranges, no ads or modal traps.</p>
          </div>
          <button disabled={starting} onClick={running ? stop : start} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${running ? "bg-red-400 text-stone-950" : "bg-amber-300 text-stone-950"}`}>{running ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />} {running ? "Stop" : starting ? "Starting" : "Use microphone"}</button>
        </div>

        {error && <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100">{error}</div>}

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-stone-950 p-6 text-center md:p-10">
          <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between text-xs uppercase tracking-[0.25em] text-stone-500"><span>Flat</span><span>Perfect</span><span>Sharp</span></div>
          <div className="relative mx-auto h-44 max-w-2xl overflow-hidden rounded-t-full border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent">
            <div className="absolute bottom-0 left-1/2 h-40 w-1 origin-bottom rounded-full bg-amber-300 transition-transform duration-100" style={{ transform: `translateX(-50%) rotate(${clampedCents * 1.25}deg)` }} />
            <div className="absolute bottom-0 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-amber-300" />
            <div className="absolute bottom-0 left-1/2 h-full w-px bg-white/20" />
          </div>
          <div className="mt-8 flex items-end justify-center gap-3">
            <span className="text-8xl font-bold tracking-tighter md:text-9xl">{stringTarget?.note ?? pitch?.note ?? "—"}</span>
            <span className="mb-4 text-3xl text-stone-500">{stringTarget?.label.replace(stringTarget.note, "") ?? pitch?.octave ?? ""}</span>
          </div>
          <p className={`mt-3 text-2xl font-semibold ${Math.abs(cents) <= 4 && frequency ? "text-emerald-300" : "text-amber-300"}`}>{status}</p>
          <p className="mt-2 font-mono text-stone-500">{frequency ? `${frequency.toFixed(2)} Hz · ${cents > 0 ? "+" : ""}${cents} cents` : "Waiting for signal"}</p>
        </div>
      </div>

      <aside className="space-y-5">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-2"><Gauge className="h-5 w-5 text-amber-300" /><h3 className="font-semibold">Preset</h3></div>
          <div className="grid gap-2">
            {INSTRUMENT_PRESETS.map((item) => (
              <button key={item.id} onClick={() => setPresetId(item.id)} className={`rounded-2xl border px-4 py-3 text-left transition ${presetId === item.id ? "border-amber-300 bg-amber-300 text-stone-950" : "border-white/10 bg-white/[0.03] hover:bg-white/10"}`}>
                <strong>{item.name}</strong>
                <p className={`text-sm ${presetId === item.id ? "text-stone-800" : "text-stone-500"}`}>{item.range[0]}–{item.range[1]} Hz</p>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <h3 className="mb-4 font-semibold">Reference strings</h3>
          {preset.strings.length ? <div className="grid grid-cols-2 gap-2">{preset.strings.map((string) => <div key={string.label} className="rounded-2xl border border-white/10 bg-stone-950/60 p-3"><strong>{string.label}</strong><p className="font-mono text-sm text-stone-500">{string.frequency.toFixed(2)} Hz</p></div>)}</div> : <p className="text-sm text-stone-500">Chromatic mode detects the nearest note across the full instrument range.</p>}
        </section>
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 text-sm text-stone-400">
          <h3 className="mb-2 font-semibold text-stone-100">Mobile notes</h3>
          <p>Works on HTTPS or localhost. iOS Safari may require tapping the microphone button after each page reload. External mics improve bass detection.</p>
        </section>
      </aside>
    </section>
  );
}
