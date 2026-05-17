export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const FLAT_TO_SHARP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
const SHARP_TO_FLAT: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };

export type PitchNote = {
  note: string;
  octave: number;
  midi: number;
  frequency: number;
  targetFrequency: number;
  cents: number;
};

function normalizeRoot(root: string) {
  return FLAT_TO_SHARP[root] ?? root;
}

function transposeRoot(root: string, semitones: number, preferFlat = false) {
  const normalized = normalizeRoot(root);
  const index = NOTE_NAMES.indexOf(normalized as (typeof NOTE_NAMES)[number]);
  if (index < 0) return root;
  const next = NOTE_NAMES[(index + semitones + 1200) % 12];
  return preferFlat && SHARP_TO_FLAT[next] ? SHARP_TO_FLAT[next] : next;
}

export function transposeChord(chord: string, semitones: number) {
  if (!chord.trim() || semitones === 0) return chord;
  return chord
    .split("/")
    .map((part) => {
      const match = part.match(/^([A-G](?:#|b)?)(.*)$/);
      if (!match) return part;
      const [, root, suffix] = match;
      return `${transposeRoot(root, semitones, root.includes("b"))}${suffix}`;
    })
    .join("/");
}

export function transposeChart(chart: string, semitones: number) {
  return chart.replace(/\[([^\]]+)]/g, (_, chord: string) => `[${transposeChord(chord, semitones)}]`);
}

export function simplifyChord(chord: string) {
  return chord
    .replace(/maj9|maj13/g, "maj7")
    .replace(/m9|m11|m13/g, "m7")
    .replace(/9|11|13|add9|sus2/g, "")
    .replace(/\(.*?\)/g, "");
}

export function simplifyChart(chart: string) {
  return chart.replace(/\[([^\]]+)]/g, (_, chord: string) => `[${simplifyChord(chord)}]`);
}

export function frequencyToNote(frequency: number): PitchNote {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const targetFrequency = 440 * 2 ** ((midi - 69) / 12);
  return {
    note,
    octave,
    midi,
    frequency,
    targetFrequency,
    cents: centsOff(frequency, targetFrequency),
  };
}

export function centsOff(frequency: number, targetFrequency: number) {
  return Math.round(1200 * Math.log2(frequency / targetFrequency));
}

export function noteFrequency(note: string, octave: number) {
  const index = NOTE_NAMES.indexOf(normalizeRoot(note) as (typeof NOTE_NAMES)[number]);
  const midi = (octave + 1) * 12 + index;
  return 440 * 2 ** ((midi - 69) / 12);
}

export function extractChords(chart: string) {
  return Array.from(new Set(Array.from(chart.matchAll(/\[([^\]]+)]/g), (match) => match[1])));
}
