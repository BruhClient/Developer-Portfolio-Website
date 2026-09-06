"use client";

import { useEffect, useRef } from "react";
import { ContactChannels, ContactForm } from "@/components/contact-form";

/*
  The contact form, unchanged, in a dialog over the world.

  `components/contact-form.tsx` was already built to be mounted more than once
  on a page (hence its `idPrefix`) and carries its own card styling, so it drops
  in here as it is. Only the section wrapper around it belonged to the old
  scrolling homepage.
*/
export function ContactModal({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("input")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Contact"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="my-auto w-full max-w-lg">
        <div className="mb-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-card px-3 py-1 text-xs text-foreground"
          >
            Esc · close
          </button>
        </div>

        <ContactForm idPrefix="world" />

        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <ContactChannels idPrefix="world" />
        </div>
      </div>
    </div>
  );
}
