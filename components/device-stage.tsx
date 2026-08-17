"use client";

/**
 * The stage the Surface Pro travels on.
 *
 * Renders the 3D canvas as a page-level fixed layer behind the content, and
 * runs the single measurement loop that tells the scene where the reader is.
 * Sections opt in by being wrapped in `<Station>`, which keeps the wiring in
 * one file rather than threading refs through all eight of them.
 *
 * Nothing here re-renders on scroll. The measurement writes into a mutable ref
 * that the 3D frame loop polls, and the scrim and blur are driven by motion
 * values — both paths deliberately bypass React, because at 60fps a render is
 * not affordable and is not needed.
 */

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import {
  STATION_ORDER,
  LAST_STATION,
  STATION_POSES,
  CONTACT_TAKEOVER,
  CONTACT_DEVICE_FRACTION,
  blendPose,
  smootherstep,
  createStageReadout,
  type StationId,
} from "@/lib/device-stations";

const DeviceScene = lazy(() =>
  import("./device-scene").then((m) => ({ default: m.DeviceScene }))
);

/** Past this station index the device has left the hero's desk behind. */
const GROUNDED_UNTIL = 1.2;

/* ────────────────────────────────────────────────────────────
   Station registration
   ──────────────────────────────────────────────────────────── */

type Register = (id: StationId, el: HTMLElement | null) => void;

interface StageValue {
  register: Register;
  /**
   * Whether the device takes over the contact form. False on touch and small
   * screens, where the Contact section renders the form itself.
   */
  hostsContactForm: boolean;
}

const StageContext = createContext<StageValue>({
  register: () => {},
  hostsContactForm: false,
});

/** Read by the Contact section to decide whether to render its own form. */
export function useDeviceStage() {
  return useContext(StageContext);
}

/**
 * Marks a section as a stop on the device's itinerary. A plain wrapper div is
 * layout-neutral here — every section is a block-level element in `<main>`'s
 * normal flow, so there is no flex parent to confuse and no margin collapse
 * that changes the result.
 */
export function Station({
  id,
  children,
}: {
  id: StationId;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { register } = useContext(StageContext);

  useLayoutEffect(() => {
    register(id, ref.current);
    return () => register(id, null);
  }, [register, id]);

  return (
    <div ref={ref} data-station={id}>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Stage
   ──────────────────────────────────────────────────────────── */

export function DeviceStage({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;

  const readout = useRef(createStageReadout());
  const elements = useRef(new Map<StationId, HTMLElement>());
  /** Station centres in document space, in itinerary order. */
  const centres = useRef<number[]>([]);
  const hero = useRef({ top: 0, height: 1 });
  const lastScroll = useRef({ y: 0, at: 0 });

  /** Pixels to drop the canvas by so the device rests in the hero's berth. */
  const heroOffset = useRef(0);

  // Scrim opacity, canvas blur, and the hero drop. Motion values so scroll can
  // drive them without a render.
  const dim = useMotionValue(0);
  const blur = useMotionValue(0);
  const shiftY = useMotionValue(0);
  const blurFilter = useTransform(blur, (px) =>
    px < 0.05 ? "none" : `blur(${px.toFixed(2)}px)`
  );

  /*
    These three do re-render, and are meant to: each flips at most a couple of
    times over a whole page, and each changes what is mounted or how the loop
    runs rather than how anything is positioned.
  */
  const [grounded, setGrounded] = useState(true);
  const [paused, setPaused] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  /* ── The contact takeover ── */

  /** Portal target for the live panel — outside the aria-hidden canvas wrapper. */
  const livePanel = useRef<HTMLDivElement>(null);
  /**
   * Latched: once the reader has reached contact the panel stays mounted, so
   * scrolling up mid-message does not throw the message away. `panelActive`
   * is what actually turns it on.
   */
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelActive, setPanelActive] = useState(false);

  const lowPower = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4
    );
  }, []);

  /*
    Whether the device is allowed to own the contact form. Resolved after mount
    rather than during render: it depends on the viewport and the pointer type,
    and guessing on the server would mean a hydration mismatch on the one part
    of the page that has to work.
  */
  const [hostsContactForm, setHostsContactForm] = useState(false);
  /* Mirrored into a ref so the scroll loop can read it without a dependency. */
  const hostsForm = useRef(false);
  useEffect(() => {
    hostsForm.current = hostsContactForm;
  }, [hostsContactForm]);

  useEffect(() => {
    if (reduced) return;
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setHostsContactForm(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [reduced]);

  const register = useCallback<Register>((id, el) => {
    if (el) elements.current.set(id, el);
    else elements.current.delete(id);
  }, []);

  const stageValue = useMemo(
    () => ({ register, hostsContactForm }),
    [register, hostsContactForm]
  );

  /* ── Measurement ── */

  const measure = useCallback(() => {
    const scrollY = window.scrollY;

    const heroEl = elements.current.get("hero");
    if (heroEl) {
      const rect = heroEl.getBoundingClientRect();
      hero.current = {
        top: rect.top + scrollY,
        height: Math.max(rect.height, 1),
      };
    }

    centres.current = STATION_ORDER.map((id) => {
      const el = elements.current.get(id);
      if (!el) return Number.NaN;
      const rect = el.getBoundingClientRect();
      return rect.top + scrollY + rect.height / 2;
    });

    /*
      The hero drop.

      The canvas is fixed and full-viewport, so left alone the device renders
      centred on the screen — straight behind the headline, which is not where
      it used to live. The hero still lays out the berth the device occupied
      when it was an in-flow element, so the honest fix is to measure that berth
      and drop the canvas onto it rather than guess a magic offset. It stays
      correct across every breakpoint, since the berth is what changes height.

      The device then rises to centre over the first station transition, which
      is the journey starting rather than a correction being applied.
    */
    const berth = document.querySelector<HTMLElement>("[data-device-berth]");
    if (berth) {
      const rect = berth.getBoundingClientRect();
      const berthCentre = rect.top + scrollY + rect.height / 2;
      heroOffset.current = berthCentre - window.innerHeight / 2;
    }

    /*
      The contact berth needs no equivalent drop: the section is nothing but
      the berth, symmetrically padded, so its centre *is* the berth's centre
      and the device is already where it belongs when the viewport centres on
      it. This checks the berth can actually hold the device, which is the part
      that does break if the pose is retuned without revisiting the section.
    */
    if (process.env.NODE_ENV !== "production") {
      const berthEl =
        document.querySelector<HTMLElement>("[data-contact-berth]");
      const needed = window.innerHeight * CONTACT_DEVICE_FRACTION;
      if (berthEl && berthEl.getBoundingClientRect().height < needed) {
        console.warn(
          "[device-stage] contact berth is shorter than the device it holds — " +
            `${Math.round(
              berthEl.getBoundingClientRect().height
            )}px for ~${Math.round(needed)}px of device.`
        );
      }
    }
  }, []);

  const update = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;
    const now = performance.now();
    const values = readout.current;

    /*
      Hero progress. Arithmetically the same quantity the hero section's own
      `useScroll({ offset: ["start start", "end start"] })` produces, and
      reliably 0 with the page at rest — which is the property the original
      choreography was built on.
    */
    values.heroP = clamp01(
      (scrollY - hero.current.top) / hero.current.height
    );

    /* Station index, from which section centre the viewport centre sits between. */
    if (!reduced) {
      const centre = scrollY + viewportH / 2;
      const marks = centres.current;
      let t = 0;

      if (marks.length > 1 && Number.isFinite(marks[0])) {
        if (centre <= marks[0]) {
          t = 0;
        } else if (centre >= marks[LAST_STATION]) {
          t = LAST_STATION;
        } else {
          for (let i = 0; i < LAST_STATION; i++) {
            const a = marks[i];
            const b = marks[i + 1];
            if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
            if (centre >= a && centre <= b) {
              t = i + (centre - a) / Math.max(b - a, 1);
              break;
            }
          }
        }
      }
      values.stationT = t;

      /* Velocity, normalised so a brisk flick lands near 1. */
      const dtMs = now - lastScroll.current.at;
      if (dtMs > 0 && lastScroll.current.at > 0) {
        const pxPerMs = (scrollY - lastScroll.current.y) / dtMs;
        values.velocity = clamp(pxPerMs / 3, -1, 1);
        values.velocityAt = now;
      }
      lastScroll.current = { y: scrollY, at: now };

      /* Scrim and depth of field, from the same pose the scene is reading. */
      const i = Math.min(Math.floor(t), LAST_STATION);
      const next = Math.min(i + 1, LAST_STATION);
      const pose = blendPose(
        STATION_POSES[i],
        STATION_POSES[next],
        smootherstep(t - i)
      );
      dim.set(pose.dim);
      blur.set(lowPower ? Math.min(pose.blur, 2) : pose.blur);
      // Rides out over the hero → about transition, so the device lifts from
      // its berth into centre frame as the journey begins.
      shiftY.set(heroOffset.current * (1 - smootherstep(Math.min(t, 1))));

      setGrounded((was) => {
        const next = t < GROUNDED_UNTIL;
        return was === next ? was : next;
      });

      /*
        The takeover. Crossing this lifts the whole stage above the page and
        hands the panel to live DOM, so it deliberately fires late — while the
        projects cards are still being read, the device must stay behind them.
      */
      const takeover = hostsForm.current && t >= CONTACT_TAKEOVER;
      setPanelActive((was) => (was === takeover ? was : takeover));
      if (takeover) setPanelMounted((was) => was || true);
    } else {
      /*
        Reduced motion: the device never leaves the hero, and the whole layer
        is faded out below it. A device fixed over every section would be
        actively hostile to someone who asked for less movement.
      */
      shiftY.set(heroOffset.current);
      setPastHero((was) => {
        const next = scrollY > hero.current.height * 0.9;
        return was === next ? was : next;
      });
    }
  }, [reduced, dim, blur, shiftY, lowPower]);

  useLayoutEffect(() => {
    measure();
    update();

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };

    const onResize = () => {
      measure();
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    /*
      Section heights move well after mount — fonts swap, images decode, the
      marquee measures itself — and every one of those shifts a station centre.
      Observing the document body catches all of it without a polling loop.
    */
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [measure, update]);

  /* Nothing to render for a tab nobody is looking at. */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <StageContext.Provider value={stageValue}>
      {/*
        Fixed and un-hittable. At rest it sits at `-z-10`, which paints above
        the body background but below in-flow content: the background
        propagates to the root canvas, so a negative-z-index child still
        covers it.

        At the contact station it lifts above the page instead. It has to: a
        transparent section still hit-tests over its whole box, so a form left
        behind the content would be visible and completely unclickable. 30
        clears the content and stays under the navbar at 40.
      */}
      <div
        className={`pointer-events-none fixed inset-0 overflow-hidden ${
          panelActive ? "z-30" : "-z-10"
        }`}
      >
        {/*
          Under reduced motion neither value is ever written, so both resolve
          to their resting state without needing a branch here.
        */}
        {/*
          aria-hidden covers the decorative 3D only. The live contact panel is
          deliberately portalled out of here — see `livePanel` below.
        */}
        <motion.div
          aria-hidden="true"
          className="h-full w-full"
          style={{ filter: blurFilter, y: shiftY }}
          // Reduced motion parks the device in the hero and dissolves the
          // layer once the reader is past it.
          animate={{ opacity: reduced && pastHero ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <Suspense fallback={null}>
            <DeviceScene
              stage={readout}
              reduced={reduced}
              lowPower={lowPower}
              grounded={grounded}
              paused={paused}
              livePanel={hostsContactForm && panelMounted ? livePanel : null}
              panelActive={panelActive}
            />
          </Suspense>
        </motion.div>

        {/*
          Scrim. The device sits dead centre behind body copy, so this is what
          keeps the text readable — it ramps up through the text-heavy middle
          of the page and eases back where the device is the point. It reaches
          zero at the contact station, where the device *is* the content.
        */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-background"
          style={{ opacity: dim }}
        />

        {/*
          Live panel target. Same origin and size as the canvas, so drei's
          projection lands identically — but outside the aria-hidden subtree,
          and painted after the scrim so nothing covers the form.
        */}
        <div ref={livePanel} className="pointer-events-none absolute inset-0" />
      </div>

      {children}
    </StageContext.Provider>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}
