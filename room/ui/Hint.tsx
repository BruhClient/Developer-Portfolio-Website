"use client";

import { useEffect, useState } from "react";
import { useRoom } from "../engine/roomState";

/*
  How long after entering the room the line appears.

  It used to live in engine/attract.ts alongside the establishing sweep, timed
  to land just after the camera settled so the two were not competing. The
  sweep is gone and nothing else needs this number, so it comes home to the one
  component that uses it. Long enough that the line arrives as a nudge to
  someone who has paused rather than as a caption on the room.
*/
const GUIDANCE_AFTER_MS = 4600;

/*
  One line, once.

  The room deliberately has no nav bar, which leaves a first-time visitor with
  no statement of the rule - and the people this site is for are recruiters,
  who arrive with about thirty seconds of patience and no reason to assume a
  picture of a bedroom is an interface. The signs name the six sections; this
  says the one thing a sign cannot say about itself, which is that it can be
  clicked, and then gets out of the way permanently.

  It leaves the moment anything is opened - at that point the visitor has the
  idea and repeating it would just be nagging.
*/
export function Hint() {
  const { state } = useRoom();
  const [ready, setReady] = useState(false);

  // Counted from entry rather than from mount, so it is measured from when the
  // visitor arrived in the room, not from how long they read the welcome.
  useEffect(() => {
    if (!state.entered) return;
    const timer = window.setTimeout(() => setReady(true), GUIDANCE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [state.entered]);

  if (!ready || state.opened.size > 0) return null;

  return (
    <p className="room-hint" role="status">
      Click a sign to open it
      <span className="room-hint__dot" aria-hidden="true">
        ·
      </span>
      six sections to explore
    </p>
  );
}
