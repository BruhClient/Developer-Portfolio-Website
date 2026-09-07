import { isMobile, type Viewport } from "../engine/focus";

/*
  Where the reader sits on screen, in CSS pixels.

  Panel.tsx states this in Tailwind classes, which only the browser can read.
  The signs need the same rectangle in numbers - a sign is positioned by
  projecting a point in the room, so nothing about CSS layout can tell it that
  it has landed on top of the reader. Stating the geometry once here and
  deriving both from it is what stops the two drifting apart; the test pins it
  against the class names Panel.tsx actually carries.
*/

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** `md:w-[45vw]` - the reader takes the right 45% of a desktop window. */
const READER_WIDTH = 0.45;

/** `h-[60svh]` - on a phone it is a bottom sheet instead. */
const SHEET_HEIGHT = 0.6;

export function readerRect(viewport: Viewport): Rect {
  if (isMobile(viewport)) {
    return {
      left: 0,
      top: viewport.height - viewport.height * SHEET_HEIGHT,
      right: viewport.width,
      bottom: viewport.height,
    };
  }
  return {
    left: viewport.width - viewport.width * READER_WIDTH,
    top: 0,
    right: viewport.width,
    bottom: viewport.height,
  };
}

/**
 * Whether a sign at this screen rectangle would touch the open reader.
 *
 * `margin` widens the reader rather than the sign, so a sign is considered to
 * have touched it slightly before it truly does: a label whose descender grazes
 * the panel's edge reads as broken, and a gap is cheaper than that.
 */
export function overlapsReader(sign: Rect, viewport: Viewport, margin = 6): boolean {
  const reader = readerRect(viewport);
  return (
    sign.right > reader.left - margin &&
    sign.left < reader.right + margin &&
    sign.bottom > reader.top - margin &&
    sign.top < reader.bottom + margin
  );
}
