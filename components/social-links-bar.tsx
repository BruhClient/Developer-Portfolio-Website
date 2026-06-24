"use client";

import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const socials = [
  { icon: Linkedin, href: "https://www.linkedin.com/in/travis-ang/", label: "LI" },
  { icon: Github, href: "https://github.com/BruhClient", label: "GH" },
  { icon: Instagram, href: "https://www.instagram.com/____travisang____/", label: "IG" },
  { icon: Twitter, href: "https://twitter.com/travisang_dev", label: "X" },
];

const SocialLinksBar = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1 px-3 py-1.5 rounded border border-border bg-background/90 backdrop-blur-sm">
      {socials.map((social) => {
        const Icon = social.icon;
        const inner = (
          <>
            <Icon className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">[{social.label}]</span>
          </>
        );

        if (shouldReduceMotion) {
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label={social.label}
            >
              {inner}
            </a>
          );
        }

        return (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-label={social.label}
          >
            {inner}
          </motion.a>
        );
      })}
    </div>
  );
};

export default SocialLinksBar;
