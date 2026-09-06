import { describe, expect, test } from "vitest";
import { stepAccumulator } from "./loop";

const FIXED = 16;
const MAX_STEPS = 5;

describe("stepAccumulator", () => {
  test("banks time without stepping until a whole tick is available", () => {
    expect(stepAccumulator(0, 10, FIXED, MAX_STEPS)).toEqual({
      steps: 0,
      remainder: 10,
    });
  });

  test("spends banked time on the next frame", () => {
    expect(stepAccumulator(10, 10, FIXED, MAX_STEPS)).toEqual({
      steps: 1,
      remainder: 4,
    });
  });

  test("runs several ticks for one long frame", () => {
    expect(stepAccumulator(0, 50, FIXED, MAX_STEPS)).toEqual({
      steps: 3,
      remainder: 2,
    });
  });

  test("drops the backlog after a stall instead of spiralling", () => {
    // A backgrounded tab hands back a five second delta. Simulating all of it
    // would take longer than the frame it is simulating, so the debt is
    // written off rather than compounded.
    expect(stepAccumulator(0, 5000, FIXED, MAX_STEPS)).toEqual({
      steps: MAX_STEPS,
      remainder: 0,
    });
  });
});
