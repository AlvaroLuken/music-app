import { centsOff } from "./music";

export type InstrumentPreset = {
  id: "chromatic" | "guitar" | "bass";
  name: string;
  range: [number, number];
  strings: { label: string; note: string; frequency: number }[];
};

export const INSTRUMENT_PRESETS: InstrumentPreset[] = [
  { id: "chromatic", name: "Chromatic", range: [40, 1400], strings: [] },
  {
    id: "guitar",
    name: "Guitar",
    range: [73, 350],
    strings: [
      { label: "E2", note: "E", frequency: 82.41 },
      { label: "A2", note: "A", frequency: 110 },
      { label: "D3", note: "D", frequency: 146.83 },
      { label: "G3", note: "G", frequency: 196 },
      { label: "B3", note: "B", frequency: 246.94 },
      { label: "E4", note: "E", frequency: 329.63 },
    ],
  },
  {
    id: "bass",
    name: "Bass",
    range: [38, 105],
    strings: [
      { label: "E1", note: "E", frequency: 41.2 },
      { label: "A1", note: "A", frequency: 55 },
      { label: "D2", note: "D", frequency: 73.42 },
      { label: "G2", note: "G", frequency: 98 },
    ],
  },
];

export function autoCorrelate(buffer: Float32Array, sampleRate: number): number | null {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return null;

  let start = 0;
  let end = buffer.length - 1;
  const threshold = 0.2;
  for (let i = 0; i < buffer.length / 2; i += 1) {
    if (Math.abs(buffer[i]) < threshold) {
      start = i;
      break;
    }
  }
  for (let i = 1; i < buffer.length / 2; i += 1) {
    if (Math.abs(buffer[buffer.length - i]) < threshold) {
      end = buffer.length - i;
      break;
    }
  }

  const slice = buffer.slice(start, end);
  const correlations = new Array(slice.length).fill(0);
  for (let lag = 0; lag < slice.length; lag += 1) {
    for (let i = 0; i < slice.length - lag; i += 1) {
      correlations[lag] += slice[i] * slice[i + lag];
    }
  }

  let d = 0;
  while (correlations[d] > correlations[d + 1]) d += 1;

  let maxValue = -1;
  let maxPosition = -1;
  for (let i = d; i < correlations.length; i += 1) {
    if (correlations[i] > maxValue) {
      maxValue = correlations[i];
      maxPosition = i;
    }
  }

  if (maxPosition <= 0) return null;
  const left = correlations[maxPosition - 1] ?? correlations[maxPosition];
  const center = correlations[maxPosition];
  const right = correlations[maxPosition + 1] ?? correlations[maxPosition];
  const shift = (right - left) / (2 * (2 * center - right - left));
  return sampleRate / (maxPosition + shift);
}

export function nearestString(frequency: number, preset: InstrumentPreset) {
  if (!preset.strings.length) return null;
  return preset.strings.reduce((nearest, current) =>
    Math.abs(current.frequency - frequency) < Math.abs(nearest.frequency - frequency) ? current : nearest,
  );
}

export function resolveInstrumentFrequency(frequency: number, preset: InstrumentPreset) {
  if (preset.id !== "bass" || !preset.strings.length) return frequency;

  const harmonicDivisors = [1, 2, 3, 4];
  let best: { frequency: number; cents: number } | null = null;

  for (const divisor of harmonicDivisors) {
    const candidate = frequency / divisor;
    for (const string of preset.strings) {
      const cents = Math.abs(centsOff(candidate, string.frequency));
      if (!best || cents < best.cents) best = { frequency: candidate, cents };
    }
  }

  return best && best.cents <= 45 ? best.frequency : frequency;
}
