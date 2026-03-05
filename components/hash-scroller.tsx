"use client";
import { useEffect } from "react";

const HashScroller = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return null;
};

export default HashScroller;
