export type ChordDiagram = {
  frets: string;
  fingers?: string;
};

export const chordDiagrams: Record<string, ChordDiagram> = {
  A: { frets: "x02220" },
  Am: { frets: "x02210" },
  A7: { frets: "x02020" },
  B: { frets: "x24442" },
  Bm: { frets: "x24432" },
  B7: { frets: "x21202" },
  C: { frets: "x32010" },
  Cmaj7: { frets: "x32000" },
  C7: { frets: "x32310" },
  D: { frets: "xx0232" },
  Dm: { frets: "xx0231" },
  D7: { frets: "xx0212" },
  E: { frets: "022100" },
  Em: { frets: "022000" },
  E7: { frets: "020100" },
  F: { frets: "133211" },
  Fm: { frets: "133111" },
  "F#": { frets: "244322" },
  "F#m": { frets: "244222" },
  G: { frets: "320003" },
  G7: { frets: "320001" },
  "G#": { frets: "466544" },
  "G#m": { frets: "466444" },
};

export function diagramFor(chord: string) {
  const normalized = chord.replace(/\/.*/, "").replace(/add9|9|11|13/g, "");
  return chordDiagrams[normalized] ?? chordDiagrams[normalized.replace(/maj7/, "")];
}
