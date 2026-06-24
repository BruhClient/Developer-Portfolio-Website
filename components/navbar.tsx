"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ModeToggle } from "./mode-toggle";
import { useRouter } from "next/navigation";

const navTabs = [
  { label: "About", href: "/#about-me" },
  { label: "Projects", href: "/#projects" },
  { label: "Hackathons", href: "/#hackathons" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const MotionNav = shouldReduceMotion ? "nav" : motion.nav;
  const navProps = shouldReduceMotion
    ? {}
    : {
        initial: { y: 0 },
        animate: { y: visible ? 0 : -100 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      };

  return (
    <MotionNav
      {...navProps}
      className="fixed top-0 left-0 right-0 z-40 px-5 py-2 bg-background border-b border-border"
    >
      <div className="max-w-4xl mx-auto flex w-full justify-between items-center">
        <div
          className="text-sm cursor-pointer text-primary font-semibold"
          onClick={() => router.push("/")}
        >
          Travis Ang
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center gap-0.5">
            {navTabs.map((tab) => (
              <a
                key={tab.label}
                href={tab.href}
                className="text-xs px-2 py-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
              >
                {tab.label}
              </a>
            ))}
          </div>
          <ModeToggle />
        </div>
      </div>
    </MotionNav>
  );
};

export default Navbar;
