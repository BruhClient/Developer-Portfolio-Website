import type { Size } from "./Camera";

/*
  How far to magnify the world.

  The camera centres a map smaller than the viewport, which is correct but shows
  as black bands when a short floor meets a tall phone. So the zoom is whatever
  covers the viewport in both axes: enough that the floor always reaches the
  edges of the screen.

  Both ends are clamped. Below MIN_ZOOM the 16x32 characters stop being
  readable; above MAX_ZOOM the pixel art turns to mush and the player sees too
  little of the room to navigate. A map small enough to need more than MAX_ZOOM
  will letterbox, which is the honest outcome for a floor that short.
*/
export const MIN_ZOOM = 1.5;
export const MAX_ZOOM = 3;

export function zoomFor(viewport: Size, map: Size): number {
  const cover = Math.max(
    viewport.width / map.width,
    viewport.height / map.height,
  );

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cover));
}
