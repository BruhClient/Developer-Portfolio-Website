/**
 * Draws a GitHub profile page (dark theme) inside a browser window onto a 2D
 * canvas, used as the Surface Pro display texture in the hero scene.
 *
 * Rendering the UI to a canvas rather than building it from meshes keeps text
 * crisp at any camera distance and costs one texture upload per repaint
 * instead of hundreds of draw calls.
 *
 * Canvas is 3:2 to match the Surface Pro display.
 *
 * Note on content: repository names and languages are real, but no follower,
 * star, or contribution *counts* are shown — inventing statistics about a real
 * account would be fabricating data, so only the shapes are decorative.
 */

/* ── Browser chrome (Edge / Chrome dark on Windows) ── */
const B = {
  tabStrip: "#2B2B2B",
  tabActive: "#3B3B3B",
  toolbar: "#3B3B3B",
  urlPill: "#262626",
  chromeText: "#E8EAED",
  chromeMuted: "#9AA0A6",
  chromeIcon: "#C4C7C5",
} as const;

/* ── GitHub dark default ── */
const G = {
  headerBg: "#010409",
  canvas: "#0D1117",
  surface: "#161B22",
  border: "#30363D",
  borderMuted: "#21262D",
  text: "#E6EDF3",
  muted: "#8B949E",
  link: "#4493F8",
  btn: "#21262D",
  btnBorder: "#3D444D",
  accent: "#F78166",
} as const;

/* Contribution heat scale, empty → hottest */
const HEAT = ["#161B22", "#0E4429", "#006D32", "#26A641", "#39D353"] as const;

/* ── Canvas geometry — 3:2, matching the Surface Pro display ── */
export const SCREEN_W = 1152;
export const SCREEN_H = 768;

const TAB_STRIP_H = 36;
const TOOLBAR_H = 40;
const CHROME_H = TAB_STRIP_H + TOOLBAR_H; // 76
const GH_HEADER_H = 56;
const PAGE_TOP = CHROME_H + GH_HEADER_H; // 132

const LEFT_X = 56;
const MAIN_X = 400;
const MAIN_W = 700;

const AVATAR_R = 72;
const AVATAR_CX = LEFT_X + AVATAR_R + 8;
const AVATAR_CY = PAGE_TOP + 44 + AVATAR_R;

/* Contribution grid */
const WEEKS = 53;
const DAYS = 7;
const CELL = 11;
const CELL_PITCH = 12.9;
const GRID_X = MAIN_X + 34;
const GRID_Y = 500;

const UI_FONT = '"Segoe UI", system-ui, -apple-system, sans-serif';

const NAV_TABS = [
  "Overview",
  "Repositories",
  "Projects",
  "Packages",
  "Stars",
] as const;

const PINNED = [
  {
    name: "Voice-Activated-Personal-AI-Assistant",
    short: "Voice-Activated-Personal-AI…",
    desc: "Agentic voice assistant built on LiveKit, LangGraph and GPT-4o.",
    lang: "Python",
    color: "#3572A5",
  },
  {
    name: "CoachAI",
    short: "CoachAI",
    desc: "Personal AI coach with live voice sessions and Stripe billing.",
    lang: "TypeScript",
    color: "#3178C6",
  },
  {
    name: "ISR-Stores-Bot",
    short: "ISR-Stores-Bot",
    desc: "Telegram bot managing stores inventory through Google Sheets.",
    lang: "Python",
    color: "#3572A5",
  },
  {
    name: "portfolio-website",
    short: "portfolio-website",
    desc: "This site — Next.js, React Three Fiber and Tailwind CSS.",
    lang: "TypeScript",
    color: "#3178C6",
  },
] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

function roundRect(
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
 * Deterministic contribution level for a cell. Seeded rather than random so
 * the graph is stable across repaints (and pure, so it can run during render).
 */
function heatLevel(week: number, day: number): number {
  const seed = (week * 7 + day + 1) * 2654435761;
  const r = ((seed >>> 0) % 1000) / 1000;

  // Weekends are quieter; recent weeks are busier.
  const weekend = day === 0 || day === 6 ? 0.45 : 1;
  const recency = 0.55 + (week / WEEKS) * 0.6;
  const score = r * weekend * recency;

  if (score < 0.26) return 0;
  if (score < 0.45) return 1;
  if (score < 0.62) return 2;
  if (score < 0.8) return 3;
  return 4;
}

/* ────────────────────────────────────────────────────────────
   Browser chrome
   ──────────────────────────────────────────────────────────── */

function drawBrowserChrome(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = B.tabStrip;
  ctx.fillRect(0, 0, SCREEN_W, TAB_STRIP_H);

  // Active tab
  const tabW = 300;
  ctx.fillStyle = B.tabActive;
  roundRect(ctx, 8, 6, tabW, TAB_STRIP_H - 6, 8);
  ctx.fill();

  // GitHub mark as the favicon
  ctx.fillStyle = "#E8EAED";
  ctx.beginPath();
  ctx.arc(28, 21, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = B.tabActive;
  ctx.beginPath();
  ctx.arc(28, 24.5, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = `13px ${UI_FONT}`;
  ctx.fillStyle = B.chromeText;
  ctx.fillText("BruhClient (Travis Ang) · GitHub", 44, 25);

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
  ctx.fillText("github.com", 172, ty + 5);
  ctx.fillStyle = B.chromeText;
  ctx.fillText("/BruhClient", 172 + ctx.measureText("github.com").width, ty + 5);
}

/* ────────────────────────────────────────────────────────────
   GitHub header
   ──────────────────────────────────────────────────────────── */

function drawGitHubHeader(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = G.headerBg;
  ctx.fillRect(0, CHROME_H, SCREEN_W, GH_HEADER_H);

  const cy = CHROME_H + GH_HEADER_H / 2;

  // GitHub Octocat mark, simplified to a solid mark at this size
  ctx.fillStyle = G.text;
  ctx.beginPath();
  ctx.arc(36, cy, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = G.headerBg;
  ctx.beginPath();
  ctx.arc(31, cy - 2, 3, 0, Math.PI * 2);
  ctx.arc(41, cy - 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(32, cy + 5, 8, 8);

  // Search box
  ctx.fillStyle = "#0D1117";
  ctx.strokeStyle = G.border;
  ctx.lineWidth = 1;
  roundRect(ctx, 66, cy - 14, 260, 28, 6);
  ctx.fill();
  ctx.stroke();

  ctx.font = `13px ${UI_FONT}`;
  ctx.fillStyle = G.muted;
  ctx.fillText("Search or jump to...", 80, cy + 4);
  ctx.strokeStyle = G.border;
  roundRect(ctx, 300, cy - 8, 16, 16, 3);
  ctx.stroke();
  ctx.fillText("/", 305, cy + 4);

  // Nav
  ctx.font = `14px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  let x = 346;
  for (const item of ["Pull requests", "Issues", "Marketplace", "Explore"]) {
    ctx.fillText(item, x, cy + 5);
    x += ctx.measureText(item).width + 22;
  }

  // Right cluster: bell, plus, avatar chip
  ctx.strokeStyle = G.text;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(SCREEN_W - 116, cy - 1, 6, Math.PI, 0);
  ctx.moveTo(SCREEN_W - 122, cy - 1);
  ctx.lineTo(SCREEN_W - 122, cy + 4);
  ctx.lineTo(SCREEN_W - 110, cy + 4);
  ctx.lineTo(SCREEN_W - 110, cy - 1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(SCREEN_W - 86, cy);
  ctx.lineTo(SCREEN_W - 74, cy);
  ctx.moveTo(SCREEN_W - 80, cy - 6);
  ctx.lineTo(SCREEN_W - 80, cy + 6);
  ctx.stroke();

  ctx.fillStyle = "#30363D";
  ctx.beginPath();
  ctx.arc(SCREEN_W - 42, cy, 11, 0, Math.PI * 2);
  ctx.fill();
}

/* ────────────────────────────────────────────────────────────
   Profile column
   ──────────────────────────────────────────────────────────── */

function drawProfile(
  ctx: CanvasRenderingContext2D,
  avatar: CanvasImageSource | null
) {
  // Avatar, clipped to a circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(AVATAR_CX, AVATAR_CY, AVATAR_R, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (avatar) {
    ctx.drawImage(
      avatar,
      AVATAR_CX - AVATAR_R,
      AVATAR_CY - AVATAR_R,
      AVATAR_R * 2,
      AVATAR_R * 2
    );
  } else {
    ctx.fillStyle = "#21262D";
    ctx.fillRect(
      AVATAR_CX - AVATAR_R,
      AVATAR_CY - AVATAR_R,
      AVATAR_R * 2,
      AVATAR_R * 2
    );
    ctx.font = `600 46px ${UI_FONT}`;
    ctx.fillStyle = G.muted;
    const initials = "TA";
    const w = ctx.measureText(initials).width;
    ctx.fillText(initials, AVATAR_CX - w / 2, AVATAR_CY + 16);
  }
  ctx.restore();

  ctx.strokeStyle = G.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(AVATAR_CX, AVATAR_CY, AVATAR_R, 0, Math.PI * 2);
  ctx.stroke();

  let y = AVATAR_CY + AVATAR_R + 40;

  ctx.font = `600 26px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  ctx.fillText("Travis Ang", LEFT_X, y);

  y += 28;
  ctx.font = `300 21px ${UI_FONT}`;
  ctx.fillStyle = G.muted;
  ctx.fillText("BruhClient", LEFT_X, y);

  // Follow button
  y += 26;
  ctx.fillStyle = G.btn;
  ctx.strokeStyle = G.btnBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, LEFT_X, y, 290, 32, 6);
  ctx.fill();
  ctx.stroke();
  ctx.font = `600 14px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  const followW = ctx.measureText("Follow").width;
  ctx.fillText("Follow", LEFT_X + 145 - followW / 2, y + 21);

  /*
    Bio is hand-broken rather than wrapped. The column is 344px wide and the
    lines below are the longest that still clear it at 16px.
  */
  y += 58;
  ctx.font = `16px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  const bio = [
    "Data Science & AI undergrad",
    "at NTU. Building agentic AI",
    "systems and the products",
    "around them.",
  ];
  for (const line of bio) {
    ctx.fillText(line, LEFT_X, y);
    y += 22;
  }

  // Meta rows
  y += 14;
  ctx.font = `16px ${UI_FONT}`;

  // Location pin
  ctx.strokeStyle = G.muted;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(LEFT_X + 6, y - 8, 5, Math.PI, 0);
  ctx.lineTo(LEFT_X + 6, y + 2);
  ctx.lineTo(LEFT_X + 1, y - 8);
  ctx.stroke();
  ctx.fillStyle = G.text;
  ctx.fillText("Singapore", LEFT_X + 22, y);

  y += 24;
  ctx.strokeStyle = G.muted;
  ctx.beginPath();
  ctx.arc(LEFT_X + 6, y - 5, 6, 0, Math.PI * 2);
  ctx.moveTo(LEFT_X, y - 5);
  ctx.lineTo(LEFT_X + 12, y - 5);
  ctx.stroke();
  ctx.fillStyle = G.link;
  ctx.fillText("travisang.dev", LEFT_X + 22, y);
}

/* ────────────────────────────────────────────────────────────
   Main column
   ──────────────────────────────────────────────────────────── */

function drawNavTabs(ctx: CanvasRenderingContext2D) {
  const y = PAGE_TOP + 30;
  ctx.font = `16px ${UI_FONT}`;

  let x = MAIN_X;
  NAV_TABS.forEach((tab, i) => {
    const active = i === 0;
    ctx.fillStyle = active ? G.text : G.muted;
    ctx.font = active ? `600 16px ${UI_FONT}` : `16px ${UI_FONT}`;
    const w = ctx.measureText(tab).width;
    ctx.fillText(tab, x, y);

    if (active) {
      ctx.fillStyle = G.accent;
      ctx.fillRect(x - 6, y + 14, w + 12, 2);
    }
    x += w + 30;
  });

  ctx.strokeStyle = G.borderMuted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MAIN_X, y + 15.5);
  ctx.lineTo(MAIN_X + MAIN_W, y + 15.5);
  ctx.stroke();
}

function drawPinned(ctx: CanvasRenderingContext2D) {
  ctx.font = `17px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  ctx.fillText("Pinned", MAIN_X, PAGE_TOP + 88);

  const cardW = (MAIN_W - 16) / 2;
  const cardH = 96;

  PINNED.forEach((repo, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MAIN_X + col * (cardW + 16);
    const y = PAGE_TOP + 104 + row * (cardH + 16);

    ctx.fillStyle = G.canvas;
    ctx.strokeStyle = G.border;
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, cardW, cardH, 6);
    ctx.fill();
    ctx.stroke();

    // Repo icon
    ctx.strokeStyle = G.muted;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(x + 14, y + 16, 10, 12);
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 25);
    ctx.lineTo(x + 24, y + 25);
    ctx.stroke();

    ctx.font = `600 15px ${UI_FONT}`;
    ctx.fillStyle = G.link;
    ctx.fillText(repo.short, x + 32, y + 26);

    // Public pill
    const pillW = 50;
    ctx.strokeStyle = G.btnBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, x + cardW - pillW - 14, y + 13, pillW, 19, 9.5);
    ctx.stroke();
    ctx.font = `11px ${UI_FONT}`;
    ctx.fillStyle = G.muted;
    ctx.fillText("Public", x + cardW - pillW - 3, y + 27);

    // Description
    ctx.font = `13px ${UI_FONT}`;
    ctx.fillStyle = G.muted;
    const words = repo.desc.split(" ");
    let line = "";
    let ly = y + 50;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > cardW - 28) {
        ctx.fillText(line, x + 14, ly);
        line = word;
        ly += 17;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x + 14, ly);

    // Language
    ctx.fillStyle = repo.color;
    ctx.beginPath();
    ctx.arc(x + 18, y + cardH - 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `13px ${UI_FONT}`;
    ctx.fillStyle = G.muted;
    ctx.fillText(repo.lang, x + 30, y + cardH - 9);
  });
}

function drawContributions(ctx: CanvasRenderingContext2D, progress: number) {
  ctx.font = `17px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  ctx.fillText("Contributions in the last year", MAIN_X, GRID_Y - 34);

  // Month labels
  ctx.font = `11px ${UI_FONT}`;
  ctx.fillStyle = G.muted;
  for (let m = 0; m < 12; m++) {
    const week = Math.round((m * WEEKS) / 12);
    ctx.fillText(MONTHS[m], GRID_X + week * CELL_PITCH, GRID_Y - 8);
  }

  // Day labels
  ["Mon", "Wed", "Fri"].forEach((label, i) => {
    const row = 1 + i * 2;
    ctx.fillText(label, MAIN_X, GRID_Y + row * CELL_PITCH + 9);
  });

  // Cells — revealed column by column
  const revealed = progress * WEEKS;
  for (let week = 0; week < WEEKS; week++) {
    if (week > revealed) break;
    // Fade the leading column in as it arrives
    const edge = Math.min(1, revealed - week);

    for (let day = 0; day < DAYS; day++) {
      const level = heatLevel(week, day);
      ctx.globalAlpha = edge;
      ctx.fillStyle = HEAT[level];
      roundRect(
        ctx,
        GRID_X + week * CELL_PITCH,
        GRID_Y + day * CELL_PITCH,
        CELL,
        CELL,
        2
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Legend
  const legendY = GRID_Y + DAYS * CELL_PITCH + 22;
  ctx.font = `12px ${UI_FONT}`;
  ctx.fillStyle = G.muted;
  ctx.fillText("Less", MAIN_X + MAIN_W - 148, legendY + 9);
  HEAT.forEach((color, i) => {
    ctx.fillStyle = color;
    roundRect(ctx, MAIN_X + MAIN_W - 116 + i * 14, legendY, CELL, CELL, 2);
    ctx.fill();
  });
  ctx.fillStyle = G.muted;
  ctx.fillText("More", MAIN_X + MAIN_W - 36, legendY + 9);
}

function drawActivity(ctx: CanvasRenderingContext2D) {
  const y = GRID_Y + DAYS * CELL_PITCH + 62;

  ctx.font = `17px ${UI_FONT}`;
  ctx.fillStyle = G.text;
  ctx.fillText("Contribution activity", MAIN_X, y);

  ctx.strokeStyle = G.borderMuted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MAIN_X, y + 10.5);
  ctx.lineTo(MAIN_X + MAIN_W, y + 10.5);
  ctx.stroke();

  // No invented counts here — see the note at the top of this file.
  const rows = [
    "Opened a pull request in BruhClient/CoachAI",
    "Created a repository BruhClient/portfolio-website",
  ];

  ctx.font = `14px ${UI_FONT}`;
  rows.forEach((row, i) => {
    const ry = y + 36 + i * 26;
    ctx.fillStyle = G.muted;
    ctx.beginPath();
    ctx.arc(MAIN_X + 6, ry - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = G.text;
    ctx.fillText(row, MAIN_X + 20, ry);
  });
}

export interface ScreenState {
  /** 0 → 1, drives the contribution graph filling in. */
  progress: number;
  /** Profile photo, once loaded. Falls back to initials. */
  avatar: CanvasImageSource | null;
}

/**
 * Paints the full page. Called on every texture refresh, so it must be
 * self-contained — it never assumes prior canvas state.
 */
export function drawGitHub(
  ctx: CanvasRenderingContext2D,
  { progress, avatar }: ScreenState
) {
  ctx.fillStyle = G.canvas;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;

  drawProfile(ctx, avatar);
  drawNavTabs(ctx);
  drawPinned(ctx);
  drawContributions(ctx, progress);
  drawActivity(ctx);
  drawGitHubHeader(ctx);
  drawBrowserChrome(ctx);
}
