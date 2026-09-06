import { ABOUT } from "@/constants/pages/about";
import { TOOLKIT_ROWS } from "@/constants/toolkit";
import type { Action } from "./dialogue";

export interface StaticEntry {
  title: string;
  beats: string[];
  action: Action | null;
}

/*
  Interactables that are not filled from the content arrays.

  About and toolkit copy is read from `constants/pages/about.ts` and
  `constants/toolkit.ts`, the same source `/about` renders from, so the beats
  here can never drift from the page they send the reader to.
*/
export const STATIC_REFS: Record<string, StaticEntry> = {
  "npc:travis": {
    title: "Travis",
    beats: [
      "Hey. Welcome in, have a look around.",
      "WASD or the arrow keys to walk. Press E on anything with a prompt over it.",
      "The corridor runs the length of the floor. Every room off it is a different part of my work.",
    ],
    action: null,
  },
  "about:portrait": {
    title: "About me",
    beats: [ABOUT.lead, ...ABOUT.sections[0].paragraphs],
    action: { label: "Read more", href: "/about", mode: "internal" },
  },
  "about:toolkit": {
    title: "Toolkit",
    beats: TOOLKIT_ROWS.map((row) => row.join(" · ")),
    action: null,
  },
  "action:resume": {
    title: "Resume",
    beats: ["A one page summary of the above, if you would rather read it that way."],
    action: { label: "Download", href: "/files/resume.pdf", mode: "download" },
  },
  "action:contact": {
    title: "Contact",
    beats: ["Send me a message and it lands in my inbox."],
    action: { label: "Open the form", mode: "modal" },
  },
  "action:socials": {
    title: "Elsewhere",
    beats: ["Email, LinkedIn and GitHub."],
    action: null,
  },
  "action:credits": {
    title: "Credits",
    beats: [
      "This floor is built from Modern Interiors by LimeZu.",
      "The engine is PixiJS. The rest of the site is Next.js.",
    ],
    action: {
      label: "limezu.itch.io",
      href: "https://limezu.itch.io/moderninteriors",
      mode: "external",
    },
  },
};
