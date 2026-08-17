/**
 * Direct contact channels.
 *
 * Lives here rather than inside `components/contact.tsx` because the Surface
 * Pro's closing screen shows the same three channels. Keeping one source means
 * the device can never advertise an address the real section no longer lists —
 * and importing from the contact component would drag emailjs and sonner into
 * the 3D bundle.
 */

export interface ContactChannel {
  label: string;
  /** What is shown — a handle, not the full URL. */
  value: string;
  href: string;
}

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  {
    label: "Email",
    value: "travisang40@gmail.com",
    href: "mailto:travisang40@gmail.com",
  },
  {
    label: "LinkedIn",
    value: "travis-ang",
    href: "https://www.linkedin.com/in/travis-ang/",
  },
  { label: "GitHub", value: "BruhClient", href: "https://github.com/BruhClient" },
] as const;
