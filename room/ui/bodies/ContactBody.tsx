"use client";

import { ContactForm } from "@/components/contact-form";
import type { ContactChannel } from "@/constants/contact";

export function ContactBody({ channels }: { channels: readonly ContactChannel[] }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-amber-50/85">
        Send a message and it lands in my inbox.
      </p>

      <ContactForm idPrefix="room" />

      <ul className="space-y-1.5 border-t border-amber-200/15 pt-4">
        {channels.map((channel) => (
          <li key={channel.label} className="text-sm">
            <span className="text-amber-100/45">{channel.label} · </span>
            <a
              href={channel.href}
              target="_blank"
              rel="noreferrer"
              className="text-amber-100 underline underline-offset-4"
            >
              {channel.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
