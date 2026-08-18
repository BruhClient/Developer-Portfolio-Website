/**
 * Draws a project page from this site onto the Surface Pro display texture.
 *
 * The device is showing *this portfolio*, not a mockup of one — the URL, the
 * palette, the titles, the tech chips and the screenshots all come from
 * `constants/pages/projects.ts`, the same source the real cards render from.
 * Nothing here is invented, so the screen can never drift from the page it
 * depicts.
 *
 * Shown while the travelling device passes the Hackathons and Projects
 * stations, cycling one project at a time.
 */

import { PROJECTS } from "@/constants/pages/projects";
import { cardImageOf } from "@/constants/pages/types";
import {
  SCREEN_W,
  SCREEN_H,
  CHROME_H,
  UI_FONT,
  MONO_FONT,
  SITE,
  SITE_HEADER_H,
  SITE_PAD_X as PAD_X,
  roundRect,
  wrapText,
  drawCover,
  drawSiteHeader,
  drawBrowserChrome,
  dotFavicon,
} from "./screen-chrome";

const PAGE_TOP = CHROME_H + SITE_HEADER_H;

const COL_L_W = 372;
const COL_R_X = PAD_X + COL_L_W + 42;
const COL_R_W = SCREEN_W - COL_R_X - PAD_X;

/** Cycle order. The cover comes from `cardImageOf`, same as the real cards. */
const SLIDES = PROJECTS.map((project, i) => ({
  slug: project.slug,
  title: project.cardTitle,
  date: project.date,
  techs: project.cardTechs ?? project.techs,
  overview: project.overview,
  image: cardImageOf(project) ?? null,
  index: i,
}));

export const PROJECT_SLIDE_COUNT = SLIDES.length;

/** Cover images the caller should preload, in cycle order. */
export const PROJECT_IMAGE_SRCS = SLIDES.map((slide) => slide.image).filter(
  (src): src is string => src !== null
);

export interface ProjectScreenState {
  /** Which project to show. Wrapped, so any integer is valid. */
  index: number;
  /** Loaded cover images keyed by `src`; missing entries fall back to a label. */
  images: Map<string, HTMLImageElement>;
}

export function drawProject(
  ctx: CanvasRenderingContext2D,
  { index, images }: ProjectScreenState
) {
  const slide =
    SLIDES[((index % SLIDES.length) + SLIDES.length) % SLIDES.length];

  ctx.fillStyle = SITE.background;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;

  /* ── Left column ── */
  let y = PAGE_TOP + 74;

  // Index kicker — the `label-mono` treatment used across the real site
  ctx.font = `12px ${MONO_FONT}`;
  ctx.fillStyle = SITE.primary;
  const counter = `${String(slide.index + 1).padStart(2, "0")} / ${String(
    SLIDES.length
  ).padStart(2, "0")}`;
  ctx.fillText(`PROJECT ${counter}`, PAD_X, y);

  y += 40;
  ctx.font = `600 34px ${UI_FONT}`;
  ctx.fillStyle = SITE.text;
  for (const line of wrapText(ctx, slide.title, COL_L_W)) {
    ctx.fillText(line, PAD_X, y);
    y += 40;
  }

  y += 6;
  ctx.font = `12px ${MONO_FONT}`;
  ctx.fillStyle = SITE.muted;
  ctx.fillText(slide.date.toUpperCase(), PAD_X, y);

  /* ── Tech chips ── */
  y += 40;
  ctx.font = `13px ${UI_FONT}`;
  let cx = PAD_X;
  for (const tech of slide.techs) {
    const w = ctx.measureText(tech).width + 22;
    if (cx + w > PAD_X + COL_L_W) {
      cx = PAD_X;
      y += 34;
    }
    ctx.fillStyle = SITE.raised;
    ctx.strokeStyle = SITE.border;
    ctx.lineWidth = 1;
    roundRect(ctx, cx, y - 17, w, 27, 13.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SITE.text;
    ctx.fillText(tech, cx + 11, y + 2);
    cx += w + 8;
  }

  /* ── Overview, clamped so it never runs past the fold ── */
  y += 48;
  ctx.font = `15px ${UI_FONT}`;
  ctx.fillStyle = SITE.muted;
  for (const line of wrapText(ctx, slide.overview, COL_L_W).slice(0, 5)) {
    ctx.fillText(line, PAD_X, y);
    y += 24;
  }

  /* ── Right column: the screenshot ── */
  const frameY = PAGE_TOP + 62;
  const frameH = SCREEN_H - frameY - 74;
  const shot = slide.image ? images.get(slide.image) : undefined;

  ctx.fillStyle = SITE.surface;
  ctx.strokeStyle = SITE.border;
  ctx.lineWidth = 1;
  roundRect(ctx, COL_R_X, frameY, COL_R_W, frameH, 12);
  ctx.fill();
  ctx.stroke();

  if (shot) {
    drawCover(ctx, shot, COL_R_X, frameY, COL_R_W, frameH, 12);
    // Re-stroke over the clipped image so the frame edge stays crisp
    ctx.strokeStyle = SITE.border;
    ctx.lineWidth = 1;
    roundRect(ctx, COL_R_X, frameY, COL_R_W, frameH, 12);
    ctx.stroke();
  } else {
    // Placeholder until the shot arrives — loading never blocks the first paint
    ctx.font = `13px ${MONO_FONT}`;
    ctx.fillStyle = SITE.muted;
    const w = ctx.measureText(slide.slug).width;
    ctx.fillText(slide.slug, COL_R_X + (COL_R_W - w) / 2, frameY + frameH / 2);
  }

  /* ── Cycle indicator ── */
  const dotY = frameY + frameH + 26;
  const dotsW = SLIDES.length * 20 - 8;
  SLIDES.forEach((_, i) => {
    const active = i === slide.index;
    ctx.fillStyle = active ? SITE.primary : SITE.border;
    roundRect(ctx, COL_R_X + (COL_R_W - dotsW) / 2 + i * 20, dotY, active ? 20 : 12, 5, 2.5);
    ctx.fill();
  });

  drawSiteHeader(ctx, "Work");
  drawBrowserChrome(ctx, {
    title: `${slide.title} · Travis Ang`,
    host: "travisang.dev",
    path: `/projects/${slide.slug}`,
    favicon: dotFavicon(SITE.primary),
  });
}
