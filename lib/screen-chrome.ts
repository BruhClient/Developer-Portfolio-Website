/**
 * Shared browser chrome for every screen the Surface Pro display can show.
 *
 * Extracted from `github-screen.ts` when the device stopped being a hero-only
 * prop and started travelling the whole page. The device now shows several
 * pages as it descends, and drawing each of them inside the *same* Edge-on-
 * Windows frame is what makes a screen change read as navigating rather than
 * as the texture being swapped out.
 *
 * The canvas is 3:2 to match the Surface Pro display. All painters work in this
 * logical 1152×768 space; `applyScreenScale` is what lets the backing store be
 * smaller on low-power devices without a single coordinate changing.
 */

/* ── Canvas geometry — 3:2, matching the Surface Pro display ── */
export const SCREEN_W = 1152;
export const SCREEN_H = 768;

/* ── Browser chrome (Edge / Chrome dark on Windows) ── */
export const B = {
  tabStrip: "#2B2B2B",
  tabActive: "#3B3B3B",
  toolbar: "#3B3B3B",
  urlPill: "#262626",
  chromeText: "#E8EAED",
  chromeMuted: "#9AA0A6",
  chromeIcon: "#C4C7C5",
} as const;

export const UI_FONT = '"Segoe UI", system-ui, -apple-system, sans-serif';
export const MONO_FONT = 'ui-monospace, "Cascadia Mono", Consolas, monospace';

export const TAB_STRIP_H = 36;
export const TOOLBAR_H = 40;
export const CHROME_H = TAB_STRIP_H + TOOLBAR_H; // 76

/* ── This site's own palette, dark theme (mirrors `.dark` in app/globals.css) ──
   Two of the screens the device shows are pages of this portfolio, so they are
   painted in the site's real colours rather than an approximation. */
export const SITE = {
  background: "#09090B",
  surface: "#131316",
  raised: "#1C1C20",
  border: "#26262B",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  primary: "#3B82F6",
} as const;

export const SITE_HEADER_H = 52;
export const SITE_PAD_X = 56;

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Maps the logical 1152×768 coordinate space onto a backing store that may be
 * smaller. Call once at the start of every repaint, before any painter runs.
 *
 * This is the whole low-power texture story: a phone renders the panel at
 * ~280px wide, so a 576×384 backing store is already beyond what it can
 * resolve, and halving it quarters the upload cost.
 */
export function applyScreenScale(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

/** Wraps `text` to `maxWidth`, using the context's current font. */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let line = "";

  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  return lines;
}

/**
 * Draws `image` into the frame with cover-fit and rounded corners — the same
 * crop behaviour as the `object-cover` media on the real page.
 */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  if (iw === 0 || ih === 0) return;

  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);

  ctx.restore();
}

/* ────────────────────────────────────────────────────────────
   Site header — shared by every screen that shows this portfolio
   ──────────────────────────────────────────────────────────── */

const SITE_NAV = ["Work", "About", "Contact"] as const;

export function drawSiteHeader(
  ctx: CanvasRenderingContext2D,
  active: (typeof SITE_NAV)[number]
) {
  ctx.fillStyle = SITE.background;
  ctx.fillRect(0, CHROME_H, SCREEN_W, SITE_HEADER_H);

  ctx.strokeStyle = SITE.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, CHROME_H + SITE_HEADER_H - 0.5);
  ctx.lineTo(SCREEN_W, CHROME_H + SITE_HEADER_H - 0.5);
  ctx.stroke();

  const cy = CHROME_H + SITE_HEADER_H / 2;

  ctx.font = `600 15px ${UI_FONT}`;
  ctx.fillStyle = SITE.text;
  ctx.fillText("Travis Ang", SITE_PAD_X, cy + 5);

  // Nav, laid out right-to-left so it stays flush to the right edge
  ctx.font = `13px ${UI_FONT}`;
  let x = SCREEN_W - SITE_PAD_X;
  for (let i = SITE_NAV.length - 1; i >= 0; i--) {
    const item = SITE_NAV[i];
    x -= ctx.measureText(item).width;
    ctx.fillStyle = item === active ? SITE.text : SITE.muted;
    ctx.fillText(item, x, cy + 5);
    x -= 30;
  }
}

/* ────────────────────────────────────────────────────────────
   Browser chrome
   ──────────────────────────────────────────────────────────── */

export interface ChromeOptions {
  /** Active tab label. */
  title: string;
  /** Domain, drawn muted in the URL pill. */
  host: string;
  /** Path, drawn bright so the eye lands on where we "are". */
  path: string;
  /**
   * Draws the tab favicon at the given centre. Left as a callback because the
   * GitHub mark is a real shape rather than a colour swatch, and flattening it
   * to a dot would lose the one detail that identifies the page at a glance.
   */
  favicon?: (ctx: CanvasRenderingContext2D, cx: number, cy: number) => void;
}

/** Default favicon: a filled dot in the supplied accent colour. */
export function dotFavicon(color: string) {
  return (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
  };
}

export function drawBrowserChrome(
  ctx: CanvasRenderingContext2D,
  { title, host, path, favicon }: ChromeOptions
) {
  ctx.fillStyle = B.tabStrip;
  ctx.fillRect(0, 0, SCREEN_W, TAB_STRIP_H);

  // Active tab
  const tabW = 300;
  ctx.fillStyle = B.tabActive;
  roundRect(ctx, 8, 6, tabW, TAB_STRIP_H - 6, 8);
  ctx.fill();

  if (favicon) {
    favicon(ctx, 28, 21);
  } else {
    dotFavicon(B.chromeMuted)(ctx, 28, 21);
  }

  ctx.font = `13px ${UI_FONT}`;
  ctx.fillStyle = B.chromeText;
  ctx.fillText(title, 44, 25);

  ctx.strokeStyle = B.chromeMuted;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(tabW - 4, 17);
  ctx.lineTo(tabW + 4, 25);
  ctx.moveTo(tabW + 4, 17);
  ctx.lineTo(tabW - 4, 25);
  ctx.stroke();

  // New tab
  ctx.beginPath();
  ctx.moveTo(tabW + 30, 21);
  ctx.lineTo(tabW + 42, 21);
  ctx.moveTo(tabW + 36, 15);
  ctx.lineTo(tabW + 36, 27);
  ctx.stroke();

  // Windows caption buttons
  const cy = TAB_STRIP_H / 2;
  ctx.strokeStyle = B.chromeIcon;
  ctx.beginPath();
  ctx.moveTo(SCREEN_W - 122, cy);
  ctx.lineTo(SCREEN_W - 112, cy);
  ctx.stroke();
  ctx.strokeRect(SCREEN_W - 76.5, cy - 4.5, 9, 9);
  ctx.beginPath();
  ctx.moveTo(SCREEN_W - 31, cy - 5);
  ctx.lineTo(SCREEN_W - 21, cy + 5);
  ctx.moveTo(SCREEN_W - 21, cy - 5);
  ctx.lineTo(SCREEN_W - 31, cy + 5);
  ctx.stroke();

  /* ── Toolbar ── */
  ctx.fillStyle = B.toolbar;
  ctx.fillRect(0, TAB_STRIP_H, SCREEN_W, TOOLBAR_H);

  const ty = TAB_STRIP_H + TOOLBAR_H / 2;
  ctx.strokeStyle = B.chromeIcon;
  ctx.lineWidth = 1.6;

  // Back
  ctx.beginPath();
  ctx.moveTo(30, ty);
  ctx.lineTo(42, ty);
  ctx.moveTo(35, ty - 5);
  ctx.lineTo(30, ty);
  ctx.lineTo(35, ty + 5);
  ctx.stroke();

  // Forward (dimmed)
  ctx.strokeStyle = "#6B6F73";
  ctx.beginPath();
  ctx.moveTo(64, ty);
  ctx.lineTo(76, ty);
  ctx.moveTo(71, ty - 5);
  ctx.lineTo(76, ty);
  ctx.lineTo(71, ty + 5);
  ctx.stroke();

  // Reload
  ctx.strokeStyle = B.chromeIcon;
  ctx.beginPath();
  ctx.arc(106, ty, 7, 0.6, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(112, ty - 8);
  ctx.lineTo(113, ty - 1);
  ctx.lineTo(106, ty - 3);
  ctx.closePath();
  ctx.fillStyle = B.chromeIcon;
  ctx.fill();

  // URL pill
  ctx.fillStyle = B.urlPill;
  roundRect(ctx, 132, TAB_STRIP_H + 7, SCREEN_W - 132 - 96, TOOLBAR_H - 14, 13);
  ctx.fill();

  // Padlock
  ctx.strokeStyle = B.chromeMuted;
  ctx.lineWidth = 1.3;
  ctx.strokeRect(150, ty - 2, 9, 7);
  ctx.beginPath();
  ctx.arc(154.5, ty - 2, 3.2, Math.PI, 0);
  ctx.stroke();

  ctx.font = `14px ${UI_FONT}`;
  ctx.fillStyle = B.chromeMuted;
  ctx.fillText(host, 172, ty + 5);
  ctx.fillStyle = B.chromeText;
  ctx.fillText(path, 172 + ctx.measureText(host).width, ty + 5);
}
