import { describe, expect, it } from "vitest";
import {
  centsOff,
  frequencyToNote,
  parseChordProLine,
  simplifyChord,
  transposeChord,
  transposeChart,
} from "./music";

describe("chord-pro parsing", () => {
  it("places each chord above the lyric segment where it enters", () => {
    expect(parseChordProLine("[Am]There is a [C]house in [D]New Orleans")).toEqual([
      { chord: "Am", lyric: "There is a " },
      { chord: "C", lyric: "house in " },
      { chord: "D", lyric: "New Orleans" },
    ]);
  });

  it("preserves leading lyrics and chord-only runs", () => {
    expect(parseChordProLine("That saved a soul like [D]me")).toEqual([
      { lyric: "That saved a soul like " },
      { chord: "D", lyric: "me" },
    ]);
    expect(parseChordProLine("[Am] [C] [D]")).toEqual([
      { chord: "Am", lyric: " " },
      { chord: "C", lyric: " " },
      { chord: "D", lyric: "" },
    ]);
  });
});

describe("chord transposition", () => {
  it("transposes plain, sharp, flat, slash, and extended chords", () => {
    expect(transposeChord("C", 2)).toBe("D");
    expect(transposeChord("Bbmaj7", 2)).toBe("Cmaj7");
    expect(transposeChord("F#/A#", -1)).toBe("F/A");
    expect(transposeChord("G#m7b5", 1)).toBe("Am7b5");
  });

  it("transposes bracketed chord charts without touching lyrics", () => {
    expect(transposeChart("[C]Words [Am]here", 2)).toBe("[D]Words [Bm]here");
  });
});

describe("chord simplification", () => {
  it("keeps useful color but removes noisy extensions", () => {
    expect(simplifyChord("Cmaj9")).toBe("Cmaj7");
    expect(simplifyChord("F#m11")).toBe("F#m7");
    expect(simplifyChord("Bbadd9")).toBe("Bb");
  });
});

describe("pitch math", () => {
  it("maps frequency to nearest chromatic note and cents", () => {
    expect(frequencyToNote(440)).toMatchObject({ note: "A", octave: 4, midi: 69 });
    expect(Math.abs(frequencyToNote(442).cents)).toBeLessThan(9);
    expect(frequencyToNote(82.41).note).toBe("E");
  });

  it("calculates signed cents against a target frequency", () => {
    expect(centsOff(440, 440)).toBe(0);
    expect(centsOff(445, 440)).toBeGreaterThan(0);
    expect(centsOff(435, 440)).toBeLessThan(0);
  });
});
