"use client";

import { useEffect, useState } from "react";
import { GUIDANCE_AFTER_MS } from "../engine/attract";
import { useRoom } from "../engine/roomState";

/*
  One line, once.

  The room deliberately has no nav bar, which leaves a first-time visitor with
  no statement of the rule - and the people this site is for are recruiters,
  who arrive with about thirty seconds of patience and no reason to assume a
  picture of a bedroom is an interface. The markers show them WHERE; this says
  WHAT, in one sentence, and then gets out of the way permanently.

  It waits for the establishing sweep to land so it is not competing with a
  moving camera, and it leaves the moment anything is opened - at that point
  the visitor has the idea and repeating it would just be nagging.
*/
export function Hint() {
  const { state } = useRoom();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), GUIDANCE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready || state.opened.size > 0) return null;

  return (
    <p className="room-hint" role="status">
      Click anything glowing
      <span className="room-hint__dot" aria-hidden="true">
        ·
      </span>
      six sections to explore
    </p>
  );
}
