"use client";

import { useEffect, useRef } from "react";
import { ABOUT } from "@/constants/pages/about";
import { PROFILE } from "@/constants/profile";
import { RESUME_HREF } from "../data/bindings";
import { useRoom } from "../engine/roomState";

/*
  The front door.

  A recruiter who lands on a dark picture of a bedroom has to work out what
  this is before they can decide whether to spend any time on it, and the room
  cannot introduce itself while it is busy being a room. So the site says who it
  belongs to first, in one line, and then offers the three things a visitor
  might actually want: the room, the same content as plain text, or the resume
  without reading anything at all.

  Offering the exit routes here rather than burying them is the point. Someone
  skimming twenty portfolios does not want a diorama, and the fastest way to
  respect that is to put the PDF on the first screen. Anyone who does want the
  diorama loses one click.

  It greets every arrival - nothing is persisted. A reload is a new arrival, and
  a welcome mat that remembers you is just a splash screen with extra steps.

  A real <dialog> opened with showModal(), not a div with aria-modal on it.
  aria-modal is a promise to a screen reader, not a behaviour: with a plain div
  Tab walked straight out of the greeting into the page's skip link and then
  into browser chrome. showModal() puts this in the top layer, inerts the whole
  document behind it and keeps Tab inside, which is the behaviour the attribute
  was only ever claiming.
*/
export function Welcome() {
  const { state, enterRoom } = useRoom();
  const dialog = useRef<HTMLDialogElement>(null);
  const enter = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.entered) return;
    const el = dialog.current;
    if (!el || el.open) return;

    try {
      el.showModal();
    } catch {
      /*
        The room behind is inert while this is up, so a dialog that failed to
        open would leave a page nothing can touch. Far better to skip the
        greeting than to lock someone out of the site over it.
      */
      enterRoom();
      return;
    }

    // The primary action takes focus, so Enter and Space work immediately and
    // a screen reader starts on the way in rather than on the heading.
    enter.current?.focus();
  }, [state.entered, enterRoom]);

  if (state.entered) return null;

  return (
    /*
      Escape closes the dialog by the browser's own rules, and closing it means
      entering - so onClose covers the keyboard without a listener of its own.
      Clicking the primary button calls enterRoom directly and unmounts this,
      which is why onClose is not the only path in.
    */
    <dialog
      ref={dialog}
      className="room-welcome"
      aria-labelledby="room-welcome-title"
      onClose={enterRoom}
    >
      <div className="room-welcome__card">
        <p className="room-welcome__eyebrow">{PROFILE.role}</p>
        <h1 className="room-welcome__title" id="room-welcome-title">
          Hello, I&rsquo;m {PROFILE.firstName}.
        </h1>
        <p className="room-welcome__lead">{ABOUT.lead}</p>

        <div className="room-welcome__actions">
          <button
            ref={enter}
            type="button"
            className="room-welcome__go"
            onClick={enterRoom}
          >
            View my room
          </button>
          <a className="room-welcome__alt" href="/text">
            Text version
          </a>
          {/*
            Same-origin, so `download` is honoured and the PDF is saved rather
            than swallowed by the browser's viewer.
          */}
          <a className="room-welcome__alt" href={RESUME_HREF} download>
            Download r&eacute;sum&eacute;
          </a>
        </div>

        <p className="room-welcome__note">
          Six sections, each one an object you can click.
        </p>
      </div>
    </dialog>
  );
}
