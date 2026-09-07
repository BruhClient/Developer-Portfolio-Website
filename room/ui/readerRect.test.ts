import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { overlapsReader, readerRect } from "./readerRect";

const desktop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

/** A sign is a small pill; these are the shapes the room actually produces. */
function signAt(x: number, y: number, width = 90, height = 20) {
  return { left: x, right: x + width, top: y, bottom: y + height };
}

describe("where the reader sits", () => {
  it("takes the right 45% of a desktop window", () => {
    expect(readerRect(desktop)).toEqual({ left: 792, top: 0, right: 1440, bottom: 900 });
  });

  it("is a bottom sheet on a phone, not a side panel", () => {
    const rect = readerRect(phone);
    expect(rect.left).toBe(0);
    expect(rect.right).toBe(390);
    expect(rect.top).toBeCloseTo(337.6, 1);
  });

  /*
    768 is the md breakpoint, and Tailwind's `md:` applies AT it. A tablet held
    upright is therefore a side panel, not a sheet - the same edge focus.ts
    documents for its item anchor.
  */
  it("switches to the side panel at the md breakpoint, not past it", () => {
    expect(readerRect({ width: 768, height: 1024 }).left).toBeCloseTo(422.4, 1);
    expect(readerRect({ width: 767, height: 1024 }).left).toBe(0);
  });
});

describe("whether a sign has landed on the reader", () => {
  it("leaves a sign in the room alone", () => {
    expect(overlapsReader(signAt(200, 400), desktop)).toBe(false);
  });

  it("catches one that crosses the reader's edge", () => {
    expect(overlapsReader(signAt(760, 400), desktop)).toBe(true);
  });

  it("catches one wholly behind the reader", () => {
    expect(overlapsReader(signAt(1000, 400), desktop)).toBe(true);
  });

  /*
    The margin widens the reader, so a sign that merely grazes it counts. A
    label touching the panel's border reads as a rendering fault, and the room
    has plenty of space to move to.
  */
  it("counts a sign that only just reaches the edge", () => {
    expect(overlapsReader(signAt(700, 400), desktop, 0)).toBe(false);
    expect(overlapsReader(signAt(700, 400), desktop, 6)).toBe(true);
  });

  it("uses the sheet's top edge on a phone, not its left", () => {
    expect(overlapsReader(signAt(120, 200), phone)).toBe(false);
    expect(overlapsReader(signAt(120, 500), phone)).toBe(true);
  });
});

/*
  The numbers above are a transcription of Panel.tsx's class names, and nothing
  in TypeScript connects the two: widening the panel to `md:w-[50vw]` would
  leave this module quietly describing the old one, and signs would reappear
  under the reader's left edge with every test still green.
*/
describe("kept in step with the panel itself", () => {
  const panel = readFileSync(join(process.cwd(), "room/ui/Panel.tsx"), "utf8");

  it("matches the width Panel.tsx asks for", () => {
    expect(panel).toContain("md:w-[45vw]");
  });

  it("matches the sheet height Panel.tsx asks for", () => {
    expect(panel).toContain("h-[60svh]");
  });
});
