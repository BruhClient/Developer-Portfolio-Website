import type { Action } from "./dialogue";

export interface StaticEntry {
  title: string;
  beats: string[];
  action: Action | null;
}

/*
  Interactables that are not filled from the content arrays.

  The About and toolkit copy here is deliberately thin. The real prose still
  lives as hard coded JSX in `components/about-me.tsx` and the tech lists in
  `components/toolkit-marquee.tsx`; milestone 4 lifts both into
  `constants/pages/about.ts` and points this file and the components at it.
  Until `/about` exists, the portrait offers no read more rather than linking
  to a page that would 404.
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
    beats: ["Second year at NTU reading Data Science and Artificial Intelligence."],
    action: null,
  },
  "about:toolkit": {
    title: "Toolkit",
    beats: [
      "Python · TypeScript · PyTorch · Pandas · SQL · Supabase · Databricks",
      "Claude Code · MCP · n8n · Docker · Google Cloud",
    ],
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
