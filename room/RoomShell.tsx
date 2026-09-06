"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hasWebGL } from "./fallback/webgl";

/*
  The room's entry point.

  A Client Component because Next 16 refuses `ssr: false` on `next/dynamic`
  inside a Server Component, and a WebGL scene genuinely cannot be
  server-rendered. Anyone whose browser cannot give us a context is sent to the
  text version rather than left looking at a black rectangle.
*/
const Room = dynamic(() => import("./engine/Room").then((m) => m.Room), { ssr: false });
const Panel = dynamic(() => import("./ui/Panel").then((m) => m.Panel), { ssr: false });

export function RoomShell() {
  /*
    Probed once during the first client render rather than in an effect, so
    there is no frame where an unsupported browser has already been handed a
    canvas it cannot draw. On the server `hasWebGL` reports true and the room is
    dynamically imported with ssr: false anyway, so nothing renders there either
    way.
  */
  const [supported] = useState(hasWebGL);

  useEffect(() => {
    if (!supported) window.location.replace("/text");
  }, [supported]);

  if (!supported) return null;

  return (
    <div className="fixed inset-0 bg-[#0b0d16]">
      <Room />
      <Panel />
      <a
        href="/text"
        className="fixed bottom-3 left-3 z-30 text-[11px] text-amber-100/35 underline underline-offset-4 hover:text-amber-100/70"
      >
        text version
      </a>
    </div>
  );
}
