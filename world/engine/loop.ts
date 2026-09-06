/**
 * Decides how many fixed-size simulation ticks a variable frame is worth.
 *
 * Physics runs on a fixed step so that collision behaves identically at 30fps
 * and 144fps. Leftover time is carried into the next frame as `remainder`.
 *
 * `maxSteps` is the safety valve. When a tab is backgrounded the browser hands
 * back a delta of several seconds; simulating all of it would take longer than
 * the frame doing the simulating, which makes the next delta larger still. The
 * backlog is written off instead of compounded.
 */
export function stepAccumulator(
  accumulatorMs: number,
  deltaMs: number,
  fixedMs: number,
  maxSteps: number,
): { steps: number; remainder: number } {
  const banked = accumulatorMs + deltaMs;
  const wanted = Math.floor(banked / fixedMs);

  if (wanted > maxSteps) return { steps: maxSteps, remainder: 0 };

  return { steps: wanted, remainder: banked - wanted * fixedMs };
}
