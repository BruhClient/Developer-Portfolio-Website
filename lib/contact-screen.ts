/**
 * The closing screen — this site's contact page, shown on the Surface Pro as
 * the reader reaches the bottom of the document.
 *
 * This is the last thing the device does before the Type Cover swings back on
 * and the panel powers down, so it carries the one message worth leaving on
 * screen: how to get in touch. Channels come from `constants/contact.ts`, the
 * same source the real Contact section renders.
 */

import { CONTACT_CHANNELS } from "@/constants/contact";
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
  drawSiteHeader,
  drawBrowserChrome,
  dotFavicon,
} from "./screen-chrome";

const PAGE_TOP = CHROME_H + SITE_HEADER_H;
const COL_W = 620;

export function drawContact(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = SITE.background;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;

  let y = PAGE_TOP + 96;

  /* ── Section kicker, matching the site's numbered headings ── */
  ctx.font = `12px ${MONO_FONT}`;
  ctx.fillStyle = SITE.primary;
  ctx.fillText("06 / CONTACT", PAD_X, y);

  /* ── Lead ── */
  y += 62;
  ctx.font = `600 46px ${UI_FONT}`;
  ctx.fillStyle = SITE.text;
  for (const line of wrapText(ctx, "Let's build something together.", COL_W)) {
    ctx.fillText(line, PAD_X, y);
    y += 56;
  }

  y += 8;
  ctx.font = `17px ${UI_FONT}`;
  ctx.fillStyle = SITE.muted;
  for (const line of wrapText(
    ctx,
    "I'm looking for an internship or mentorship where I can grow as an engineer. The inbox is open.",
    COL_W
  )) {
    ctx.fillText(line, PAD_X, y);
    y += 26;
  }

  /* ── Channels ── */
  y += 46;
  for (const channel of CONTACT_CHANNELS) {
    ctx.font = `11px ${MONO_FONT}`;
    ctx.fillStyle = SITE.muted;
    ctx.fillText(channel.label.toUpperCase(), PAD_X, y);

    ctx.font = `19px ${UI_FONT}`;
    ctx.fillStyle = SITE.text;
    ctx.fillText(channel.value, PAD_X + 130, y);

    // Hairline under each row, the same rhythm the real list uses
    ctx.strokeStyle = SITE.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_X, y + 18.5);
    ctx.lineTo(PAD_X + COL_W, y + 18.5);
    ctx.stroke();

    y += 58;
  }

  /* ── Availability card, right column ── */
  const cardX = PAD_X + COL_W + 56;
  const cardW = SCREEN_W - cardX - PAD_X;
  const cardY = PAGE_TOP + 150;
  const cardH = 240;

  ctx.fillStyle = SITE.surface;
  ctx.strokeStyle = SITE.border;
  ctx.lineWidth = 1;
  roundRect(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();

  // Live dot
  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.arc(cardX + 30, cardY + 42, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = `12px ${MONO_FONT}`;
  ctx.fillStyle = SITE.muted;
  ctx.fillText("AVAILABLE", cardX + 46, cardY + 46);

  ctx.font = `600 22px ${UI_FONT}`;
  ctx.fillStyle = SITE.text;
  let cy = cardY + 92;
  for (const line of wrapText(ctx, "Open to internships", cardW - 56)) {
    ctx.fillText(line, cardX + 28, cy);
    cy += 28;
  }

  ctx.font = `15px ${UI_FONT}`;
  ctx.fillStyle = SITE.muted;
  cy += 8;
  for (const line of wrapText(
    ctx,
    "Singapore · NTU Data Science & AI",
    cardW - 56
  )) {
    ctx.fillText(line, cardX + 28, cy);
    cy += 22;
  }

  drawSiteHeader(ctx, "Contact");
  drawBrowserChrome(ctx, {
    title: "Contact · Travis Ang",
    host: "travisang.dev",
    path: "/#contact",
    favicon: dotFavicon(SITE.primary),
  });
}
