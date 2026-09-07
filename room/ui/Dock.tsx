"use client";

import { CONTACT_CHANNELS } from "@/constants/contact";
import { RESUME_HREF } from "../data/bindings";
import { useRoom } from "../engine/roomState";

/*
  The bar along the bottom of the room.

  Two things a visitor may want at any moment and should never have to hunt
  for: the resume, and a way to reach me. Until now both were inside the room -
  the resume behind the Experience panel, the channels behind the door - which
  is fine for someone exploring and hopeless for someone who has decided in the
  first ten seconds that they want the PDF and nothing else.

  It absorbs the text-version link that used to sit loose in the corner. Three
  small fixed things stacked in the same corner would have fought each other;
  one bar is also the honest description of what they are, which is the set of
  ways out of the room.

  Bottom LEFT rather than centred, and that is load-bearing: the reader panel
  takes the right 45% of a desktop window, so a centred bar would sit under it
  the moment anything is open.
*/
export function Dock() {
  const { state } = useRoom();

  // The welcome screen already offers the resume and the text version, and the
  // room behind it is inert. A second copy there would just be clutter.
  if (!state.entered) return null;

  return (
    <div className="room-dock">
      {/* Same-origin, so `download` is honoured rather than handing the PDF
          to the browser's own viewer. */}
      <a className="room-dock__resume" href={RESUME_HREF} download>
        <span aria-hidden="true">&darr;</span> R&eacute;sum&eacute;
      </a>

      <nav className="room-dock__links" aria-label="Elsewhere">
        {CONTACT_CHANNELS.map((channel) => {
          // mailto: must not get target/rel; only the http ones leave the tab.
          const external = channel.href.startsWith("http");
          return (
            <a
              key={channel.label}
              className="room-dock__link"
              href={channel.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer noopener" : undefined}
            >
              {channel.label}
            </a>
          );
        })}
      </nav>

      <a className="room-dock__text" href="/text">
        Text version
      </a>
    </div>
  );
}
