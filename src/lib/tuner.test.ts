import { describe, expect, it } from "vitest";
import { INSTRUMENT_PRESETS, resolveInstrumentFrequency } from "./tuner";

const guitar = INSTRUMENT_PRESETS.find((preset) => preset.id === "guitar")!;
const bass = INSTRUMENT_PRESETS.find((preset) => preset.id === "bass")!;

describe("instrument-specific tuner frequency handling", () => {
  it("leaves guitar detections untouched", () => {
    expect(resolveInstrumentFrequency(82.41, guitar)).toBe(82.41);
    expect(resolveInstrumentFrequency(110, guitar)).toBe(110);
  });

  it("folds strong bass harmonics back to their fundamental", () => {
    expect(resolveInstrumentFrequency(82.4, bass)).toBeCloseTo(41.2, 2);
    expect(resolveInstrumentFrequency(110, bass)).toBeCloseTo(55, 2);
    expect(resolveInstrumentFrequency(146.84, bass)).toBeCloseTo(73.42, 2);
    expect(resolveInstrumentFrequency(196, bass)).toBeCloseTo(98, 2);
  });

  it("preserves detuning when folding bass harmonics", () => {
    expect(resolveInstrumentFrequency(84, bass)).toBeCloseTo(42, 2);
  });
});
