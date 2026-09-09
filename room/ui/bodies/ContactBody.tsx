"use client";

import { ContactForm } from "@/components/contact-form";
import type { ContactChannel } from "@/constants/contact";
import { Cue } from "../Cue";

export function ContactBody({ channels }: { channels: readonly ContactChannel[] }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-amber-50/85">
        Send a message and it lands in my inbox.
      </p>

      <ContactForm idPrefix="room" />

      <ul className="space-y-2 border-t border-amber-200/15 pt-4">
        {channels.map((channel) => {
          /*
            Only the http ones leave the tab. A mailto: with target="_blank"
            opens a blank window that the mail handler then abandons, which is
            the empty tab you cannot explain - the dock already avoids this and
            this list was not.
          */
          const external = channel.href.startsWith("http");
          return (
            <li key={channel.label} className="text-sm">
              <span className="text-amber-100/45">{channel.label} · </span>
              <a
                href={channel.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
                aria-label={`${channel.label}: ${channel.value} — ${
                  external ? "opens in a new tab" : "opens your mail app"
                }`}
                className="group inline-flex items-center gap-2 text-amber-100"
              >
                {/* The rule belongs to the handle, not to the whole link: an
                    ancestor's underline is drawn through its descendants, so
                    with it on the <a> the cue got underlined too. */}
                <span className="underline underline-offset-4">{channel.value}</span>
                <Cue kind="external">
                  {external ? "Opens in a new tab" : "Opens your mail app"}
                </Cue>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
