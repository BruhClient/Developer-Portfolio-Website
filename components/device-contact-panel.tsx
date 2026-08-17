"use client";

/**
 * What the Surface Pro's display becomes at the end of the journey: not a
 * picture of a contact page, but the contact page — real inputs, real links,
 * real focus.
 *
 * Rendered through drei's `<Html transform>` so it is ordinary DOM mapped onto
 * the display plane. Laid out at the panel's native 1152×768 and scaled down in
 * 3D, which is why the type sizes here look like a small laptop screen rather
 * than like something being shrunk: at this size, normal styling *is* the right
 * styling, and text stays vector-crisp through the transform.
 *
 * Deliberately echoes `lib/contact-screen.ts`, the painted version underneath,
 * so the handover from texture to live DOM reads as the page finishing loading
 * rather than as a swap.
 */

import { ContactChannels, ContactForm } from "./contact-form";

/**
 * Native panel size. 3:2, matching the display mesh.
 *
 * Deliberately smaller than the 1152×768 texture it replaces. The panel is laid
 * out at this size and then mapped onto a fixed-width plane, so the native size
 * is the type scale: every px here reads as px ÷ PANEL_H of the display's
 * on-screen height. At the contact pose the display lands ~514px tall on a
 * 900px viewport, which puts this layout within a few percent of 1:1 — 15px
 * copy renders at 15px. At 1152×768 the same copy rendered at ~11px.
 */
export const PANEL_W = 864;
export const PANEL_H = 576;

const NAV = ["Work", "About", "Contact"];

export function DeviceContactPanel() {
  return (
    <div
      style={{ width: PANEL_W, height: PANEL_H }}
      className="pointer-events-auto flex select-none flex-col overflow-hidden bg-background text-foreground"
    >
      {/* ── Site header, matching the painted chrome it replaces ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-12 py-3.5">
        <span className="text-[15px] font-semibold">Travis Ang</span>
        <nav className="flex items-center gap-8 text-[13px]">
          {NAV.map((item) => (
            <span
              key={item}
              className={
                item === "Contact" ? "text-foreground" : "text-muted-foreground"
              }
            >
              {item}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 gap-10 px-12 py-8">
        {/* ── Invitation + direct channels ── */}
        <div className="flex w-[42%] shrink-0 flex-col">
          <p className="label-mono text-primary">06 — CONTACT</p>

          <h2 className="font-heading mt-4 text-3xl leading-tight font-semibold tracking-tight">
            Let&apos;s build something together.
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            I&apos;m looking for an internship or mentorship where I can grow as
            an engineer. The inbox is open.
          </p>

          <div className="mt-7 select-text">
            <ContactChannels idPrefix="panel" />
          </div>
        </div>

        {/* ── The live form ── */}
        <div className="min-w-0 flex-1 select-text">
          <ContactForm idPrefix="panel-contact" className="h-full" />
        </div>
      </div>
    </div>
  );
}
