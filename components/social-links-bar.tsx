"use client";

import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const SOCIALS = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/travis-ang/",
    label: "LinkedIn",
  },
  { icon: Github, href: "https://github.com/BruhClient", label: "GitHub" },
  {
    icon: Instagram,
    href: "https://www.instagram.com/____travisang____/",
    label: "Instagram",
  },
  { icon: Twitter, href: "https://twitter.com/travisang_dev", label: "X" },
];

/**
 * Site footer. Replaces the old floating overlay bar, which sat on top of
 * page content and covered it on short viewports.
 */
const SocialLinksBar = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 sm:px-8 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-heading text-sm font-semibold tracking-tight">
            Travis Ang
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            © {new Date().getFullYear()} · Built with Next.js and Three.js
          </p>
        </div>

        <ul className="flex items-center gap-1">
          {SOCIALS.map(({ icon: Icon, href, label }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                // 44px box satisfies the minimum touch target
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default SocialLinksBar;
