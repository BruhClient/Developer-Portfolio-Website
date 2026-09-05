"use client";

/**
 * The hero device's container, and everything that decides whether it renders.
 *
 * The 3D scene used to be mounted unconditionally on a fixed, full-viewport
 * layer with no capability check and no fallback, so anywhere WebGL was
 * unavailable or the context request was refused the page simply showed
 * nothing — no error, no placeholder, just a gap. This owns that decision
 * instead:
 *
 *   · feature-detect WebGL before mounting anything
 *   · catch a scene that throws, or a context that is lost, and fall back
 *   · stop rendering entirely once the device scrolls out of view
 *
 * The container is a normal in-flow block, so it contributes real layout
 * height and the device sits where the hero puts it at every breakpoint.
 */

import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

const DeviceScene = lazy(() =>
  import("./device-scene").then((m) => ({ default: m.DeviceScene }))
);

/* ────────────────────────────────────────────────────────────
   Capability detection
   ──────────────────────────────────────────────────────────── */

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    /*
      Release it immediately. Browsers cap the number of live contexts per
      page, and a probe that holds one makes the real canvas the request that
      gets refused.
    */
    (gl as WebGLRenderingContext)
      .getExtension("WEBGL_lose_context")
      ?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/*
  Read through `useSyncExternalStore` rather than probed in an effect. The
  answer is a fact about the browser, not React state to be synchronised, and
  the store form gives the server a defined snapshot (null — decide nothing,
  render nothing) without a setState-in-effect cascade on the client.

  Cached at module scope because getSnapshot is called on every render and
  creating a WebGL context per render would be absurd.
*/
let webglSupport: boolean | null = null;

function getWebGLSnapshot(): boolean {
  if (webglSupport === null) webglSupport = detectWebGL();
  return webglSupport;
}

/** Never changes after load, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};

/* ────────────────────────────────────────────────────────────
   Error boundary — React has no hook form of this
   ──────────────────────────────────────────────────────────── */

class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ────────────────────────────────────────────────────────────
   Poster — the device where WebGL can't draw it
   ────────────────────────────────────────────────────────────
   Drawn inline rather than loaded as an image on purpose. This is
   the path that runs when something has already gone wrong, so it
   must not depend on a second network request that can 404 or be
   blocked in turn. It is also resolution-independent and picks up
   the palette from the same tokens as the rest of the page.
   ──────────────────────────────────────────────────────────── */

function Poster() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      role="presentation"
      focusable="false"
    >
      {/* Desk shadow */}
      <ellipse cx="200" cy="266" rx="132" ry="10" fill="var(--foreground)" opacity="0.07" />

      {/* Kickstand */}
      <path d="M182 96 L182 250 L120 258 Z" fill="var(--muted-foreground)" opacity="0.35" />

      {/* Tablet body, leaning back ~10° */}
      <g transform="rotate(-4 200 165)">
        <rect x="82" y="60" width="236" height="172" rx="10" fill="#B9BDC4" />
        <rect x="90" y="68" width="220" height="156" rx="6" fill="#0A0A0C" />
        {/* Display */}
        <rect x="97" y="75" width="206" height="142" rx="3" fill="#141821" />
        {/* Suggestion of the profile screen: avatar, name bar, contribution grid */}
        <circle cx="122" cy="100" r="12" fill="var(--muted-foreground)" opacity="0.55" />
        <rect x="142" y="93" width="72" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.5" />
        <rect x="142" y="105" width="48" height="5" rx="2.5" fill="var(--muted-foreground)" opacity="0.3" />
        {Array.from({ length: 7 }).map((_, row) =>
          Array.from({ length: 18 }).map((__, col) => (
            <rect
              key={`${row}-${col}`}
              x={110 + col * 10}
              y={132 + row * 10}
              width="7"
              height="7"
              rx="1.5"
              fill="#6F4E37"
              opacity={0.18 + ((row * 7 + col * 3) % 5) * 0.16}
            />
          ))
        )}
      </g>

      {/* Type Cover, lying flat */}
      <path d="M96 236 L304 236 L336 262 L64 262 Z" fill="#0C0D10" />
      <path d="M112 242 L288 242 L306 256 L94 256 Z" fill="#2A2D33" opacity="0.55" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   DeviceHero
   ──────────────────────────────────────────────────────────── */

export function DeviceHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  /* null on the server = not yet decided, so nothing is rendered until it is */
  const canRender3D = useSyncExternalStore<boolean | null>(
    subscribeToNothing,
    getWebGLSnapshot,
    () => null
  );
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [leans, setLeans] = useState(false);

  const handleError = useCallback(() => setFailed(true), []);

  /*
    Re-evaluated on resize, not just measured once. A tablet rotated into
    landscape, or a window dragged onto a different display, changes the answer
    — and the old one-shot useMemo kept a phone's settings on a desktop for the
    rest of the session.
  */
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      setLowPower(
        window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4
      );
    };
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Pointer lean is a mouse affordance; on touch it just burns frames. */
  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setLeans(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /*
    The whole point of moving the device into the hero: once it is scrolled
    past, it stops rendering. Rendering resumes if the reader comes back up.
  */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [canRender3D]);

  /* Nothing to render for a tab nobody is looking at. */
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const showPoster = canRender3D === false || failed;

  return (
    /*
      Deliberately taller than a decoration: the device is the point of the
      hero, and letting it run toward the fold invites the scroll. It is
      width-bound on narrow screens, where extra height would only add empty
      space — hence the smaller mobile value.

      pointer-events-none so the hero's buttons and copy above stay usable;
      the scene reads pointer moves off the body instead.
    */
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none relative mt-6 h-[46svh] w-full sm:h-[56svh] lg:mt-4 lg:h-[68svh]"
    >
      {showPoster ? (
        <Poster />
      ) : canRender3D ? (
        <SceneBoundary onError={handleError}>
          <Suspense fallback={null}>
            <DeviceScene
              reduced={reduced}
              lowPower={lowPower}
              leans={leans && !reduced}
              paused={!inView || hidden}
              onError={handleError}
            />
          </Suspense>
        </SceneBoundary>
      ) : null}
    </div>
  );
}
