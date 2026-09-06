"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import SocialLinksBar from "./social-links-bar";
import { ScrollProgress } from "./scroll-progress";

/*
  The world is the homepage, and it fills the viewport edge to edge. A fixed
  navbar and a scroll progress bar would sit on top of it, and a footer in
  normal flow would hang below a page that does not scroll — so the chrome
  steps aside on `/` and appears everywhere else.

  Navigation on the homepage is walking; the nav links come back the moment you
  open a project.
*/
function useIsWorld() {
  return usePathname() === "/";
}

export function SiteHeader() {
  if (useIsWorld()) return null;
  return (
    <>
      <ScrollProgress />
      <Navbar />
    </>
  );
}

export function SiteFooter() {
  if (useIsWorld()) return null;
  return <SocialLinksBar />;
}
