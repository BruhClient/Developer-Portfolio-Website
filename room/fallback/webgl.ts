/*
  Whether this browser can run the room at all.

  A locked-down work laptop or an old phone gets a blank screen otherwise, and
  that visitor is very often the one deciding whether to interview you.
*/
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ?? canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}
