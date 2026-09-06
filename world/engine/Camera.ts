export interface Size {
  width: number;
  height: number;
}

/**
 * One axis of the camera. Centres on the target, but refuses to show anything
 * outside the map. When the map is shorter than the viewport on this axis
 * there is nothing to scroll, so the map is centred instead of pinned to zero.
 */
function axis(target: number, viewportLength: number, mapLength: number) {
  if (mapLength <= viewportLength) return (mapLength - viewportLength) / 2;
  const centred = target - viewportLength / 2;
  return Math.min(Math.max(centred, 0), mapLength - viewportLength);
}

/** Top-left corner of the camera in world coordinates. */
export function cameraTopLeft(
  target: { x: number; y: number },
  viewport: Size,
  map: Size,
): { x: number; y: number } {
  return {
    x: axis(target.x, viewport.width, map.width),
    y: axis(target.y, viewport.height, map.height),
  };
}
