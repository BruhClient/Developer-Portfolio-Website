"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRoom } from "./engine/roomState";
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
const Hint = dynamic(() => import("./ui/Hint").then((m) => m.Hint), { ssr: false });
const Welcome = dynamic(() => import("./ui/Welcome").then((m) => m.Welcome), { ssr: false });
const Dock = dynamic(() => import("./ui/Dock").then((m) => m.Dock), { ssr: false });

export function RoomShell() {
  /*
    Probed once during the first client render rather than in an effect, so
    there is no frame where an unsupported browser has already been handed a
    canvas it cannot draw. On the server `hasWebGL` reports true and the room is
    dynamically imported with ssr: false anyway, so nothing renders there either
    way.
  */
  const [supported] = useState(hasWebGL);
  const { state } = useRoom();

  useEffect(() => {
    if (!supported) window.location.replace("/text");
  }, [supported]);

  if (!supported) return null;

  return (
    <div className="room-stage fixed inset-0 bg-[#0b0d16]">
      {/*
        The room mounts and loads its models behind the welcome screen, so
        entering is instant rather than a second wait - but it is `inert` until
        then. Without that the six signs are still in the tab ring and still
        clickable through a backdrop that is only mostly opaque, which is a
        dialog in appearance only.
      */}
      <div className="absolute inset-0" inert={!state.entered}>
        <Room />
        <Panel />
        <Hint />
        {/* The text-version link used to sit loose in this corner; it lives in
            the dock now, next to the other ways out of the room. */}
        <Dock />
      </div>
      <Welcome />
    </div>
  );
}
