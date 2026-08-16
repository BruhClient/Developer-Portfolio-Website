# Travis Ang Portfolio — Design System (Master)

Global source of truth. Page-specific deviations live in `pages/<page>.md` and
override anything here. This file documents the system **as built**, not as
originally recommended.

---

## 1. Direction

| Aspect | Decision |
|---|---|
| Pattern | Portfolio Grid — visuals first, work leads |
| Style | Motion-driven, editorial minimal |
| Voice | Clean, modern, professional. Not "developer aesthetic" |
| Wow factor | One real-time 3D sculpture in the hero, scroll + pointer driven |
| Anti-patterns | Terminal/hacker chrome, monospace UI, glitch effects, corporate stock layouts |

The previous terminal theme (JetBrains Mono UI, violet glow, ASCII art, typing
effects) was removed entirely. Monospace survives **only** as a metadata label.

---

## 2. Color

Neutral canvas, single blue accent. Both modes are first-class — there is no
forced theme.

### Light (`:root`)
| Role | Hex |
|---|---|
| Background | `#FAFAFA` |
| Card / raised surface | `#FFFFFF` |
| Sunken surface | `#F4F4F5` |
| Foreground | `#09090B` |
| Muted foreground | `#52525B` |
| Border | `#E4E4E7` |
| Primary / accent | `#2563EB` |

### Dark (`.dark`)
| Role | Hex |
|---|---|
| Background | `#09090B` |
| Card / raised surface | `#131316` |
| Sunken surface | `#0D0D0F` |
| Foreground | `#FAFAFA` |
| Muted foreground | `#A1A1AA` |
| Border | `#26262B` |
| Primary / accent | `#3B82F6` |
| On-primary | `#09090B` (near-black, **not** white) |

**Rules**
- Accent is for emphasis and interaction only — never for large fills.
- Dark mode puts **near-black on the blue button**, not white: white on
  `#3B82F6` is 3.7:1 and fails AA at 14px; `#09090B` on it is 5.35:1.
  Light mode keeps white on `#2563EB` (5.12:1).
- Muted foreground is `#52525B` / `#A1A1AA`; both clear 4.5:1. Never go lighter
  than these for body copy.
- Use the semantic token (`bg-card`, `text-muted-foreground`), never a raw hex.

---

## 3. Typography

| Role | Family | Variable |
|---|---|---|
| Display / headings | **Archivo** (400–700) | `--font-display` → `font-heading` |
| Body / UI | **Space Grotesk** (300–600) | `--font-body` → `font-sans` |
| Metadata labels only | **JetBrains Mono** (400–500) | `--font-mono` → `.label-mono` |

- Headings: `font-weight: 600`, `line-height: 1.1`, `letter-spacing: -0.022em`,
  `text-wrap: balance`.
- Body: 16px base, `line-height: 1.65`, `text-wrap: pretty`.
- Cap body measure with `.measure` (68ch) — keeps lines in the 65–75 char range.
- `.label-mono` = 11px, uppercase, `0.14em` tracking, tabular numerals. Use for
  dates, section indices, kickers. **Never** for body or headings.

---

## 4. Spacing & Layout

- Container: `max-w-6xl` everywhere (detail pages `max-w-5xl`). Do not mix widths.
- Section rhythm: `py-24` mobile, `lg:py-32` desktop.
- Page gutters: `px-5` mobile, `sm:px-8`.
- Radius scale from `--radius: 0.75rem`. Cards use `rounded-xl`; pills and
  buttons use `rounded-full`.
- `scroll-padding-top: 7rem` on `html` so the floating nav never covers an
  anchored heading.
- `overflow-x: clip` on body — nothing scrolls sideways.

### z-index scale
`10` base · `20` sticky · `30` overlay · `40` nav · `50` modal / progress bar

---

## 5. Motion

The brief was explicitly **"actual moving parts, not fade in / fade out."**
Every reveal travels a real distance or is scrubbed by scroll position.

| Primitive | File | Behaviour |
|---|---|---|
| `MaskText` | `components/reveal.tsx` | Words rise from behind a clipping edge, staggered. No opacity fade. |
| `Reveal` | `components/reveal.tsx` | Directional block entrance; travel is primary, opacity secondary. |
| `Stagger` / `StaggerItem` | `components/reveal.tsx` | Sequenced grid and list entrances. |
| `Parallax` | `components/parallax.tsx` | Spring-smoothed counter-scroll drift. |
| `ScrollScale` | `components/parallax.tsx` | Media scales down into its frame as it enters. |
| `ScrollRotate` | `components/parallax.tsx` | Scroll-scrubbed rotation. |
| `ScrollProgress` | `components/scroll-progress.tsx` | Sprung hairline read-progress bar. |
| `ToolkitMarquee` | `components/toolkit-marquee.tsx` | Two counter-scrolling CSS bands, additionally nudged by scroll. |

**Standard easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo).
**Durations:** 150–300ms for hover/state, 700–1100ms for scroll reveals.

**Reduced motion is non-negotiable.** CSS kills decorative loops; every
JS-driven primitive checks `useReducedMotion()` and returns a static element.
Scroll-linked transforms cannot be reached by CSS, so they must be guarded in JS.

---

## 6. 3D (`components/hero-3d-scene.tsx`)

A **Microsoft Surface Pro** showing the GitHub profile, full-bleed beneath the
hero copy. The motif is deliberately developer-facing, so the **execution**
carries the "professional" half of the brief: correct proportions, matte
materials, a real studio light rig, and genuine Windows browser chrome — never
a boxy prop.

**Resting yaw is kept shallow (`BASE_YAW = -0.15`)** and the scroll turn-away is
smaller than the fold. Every degree of yaw foreshortens the display, and the
screen content is the thing worth reading.

**Proportions** (1 unit ≈ 100 mm, tracking a real device: 287 × 209 × 9.3 mm)
- Display is **3:2**, the Surface signature. Getting this wrong is the single
  biggest tell.
- Tablet, kickstand, trackpad, and cover are all `RoundedBox` — never
  hard-edged `boxGeometry`.
- 84 Type Cover keys are one `instancedMesh` — one draw call, not eighty-four.

**Materials — the main defence against a CGI look**
| Part | Treatment |
|---|---|
| Tablet + kickstand | Matte magnesium: `metalness 0.82, roughness 0.48`. **Not chrome** — mirror finish is what reads as AI-generated. |
| Type Cover deck | Black Alcantara `#0C0D10`: `metalness 0, roughness 0.95`. Fabric absorbs light. |
| Key caps | `#2A2D33`, `roughness 0.38` — **markedly lighter than the deck.** |
| Key well | `#060709`, recessed beneath the caps to frame the field. |
| Trackpad | Black glass: `metalness 0.3, roughness 0.1`. |

**The key caps must be lighter than the fabric.** This was backwards once —
near-black caps on near-black Alcantara gave the deck no internal structure, so
the Type Cover read as a featureless box. A box that vanishes on scroll looks
like a rendering bug, not a detach. Moulded plastic catches far more light than
matte fabric, so the lighter cap is also the truthful choice.

Caps are 3mm tall rather than a realistic 1.6mm for the same reason: the camera
sees the deck at ~71° off-axis, so it is the *side* of the cap, not its top,
that separates one row from the next.

Detail work that sells it: Windows Hello camera cluster, power and volume keys
on the top edge, magnetic connector strip along the hinge, and a soft diagonal
glass reflection over the panel.

**Screen** (`lib/github-screen.ts`)
- The **GitHub profile** (`github.com/BruhClient`, dark theme) inside a browser
  window, drawn to a 1152×768 (3:2) canvas and used as a `CanvasTexture`.
  Canvas beats meshes here: text stays crisp at any camera distance and costs
  one texture upload per repaint instead of hundreds of draw calls.
- Full chrome: browser tab strip, URL bar, GitHub header, profile column with
  avatar and bio, nav tabs, pinned repo cards, contribution graph, activity.
- The **contribution graph fills in column by column** (3.2s), holds 4.5s, then
  loops. Heat levels are seeded from cell coordinates — deterministic, so the
  graph is stable across repaints and pure enough to run during render.
- Repaints are quantised to graph columns, not frames.
- The avatar is `/aboutme/profile(1).jpeg`, loaded imperatively so a slow image
  never blocks the first paint; falls back to initials until it arrives.
- **No fabricated statistics.** Repo names and languages are real; follower,
  star, and contribution *counts* are omitted rather than invented, since the
  page depicts a real account.
- `meshBasicMaterial` + `toneMapped={false}` — a display emits its own light and
  must not be shaded by the rig. The texture is built on the first frame and
  attached via a material ref, since it is mutated on every repaint.
- **The material colour multiplies the map.** It starts near-black to stand in
  for the panel's off state, so it *must* be set to white the moment the texture
  attaches. Leaving it dark renders the whole page at ~6% brightness — the
  screen looks blank rather than dim, which is exactly how it failed once.
- Type is set roughly 1.2× real GitHub sizes, floor 11px. The panel is ~600px
  wide at 1440, so the 1152px texture lands at ~52% — anything drawn at true
  browser sizes is unreadable after that downscale.
- The glass sheen is kept under 4% opacity. A screen with no reflection reads as
  a decal, but a stronger one washes out the UI, which is the point of the
  display.

**Lighting**
- Self-contained `Environment` of four `Lightformer` area lights (key, blue rim,
  warm fill, overhead ring). No HDRI download — never depends on a CDN.
- Rig intensity shifts with the active theme. `ContactShadows` grounds it.
- **No page-level glow behind the device.** The hero once had a blurred accent
  bloom; it lifted the black levels the display sits against and cost the screen
  its contrast. The device is lit only by its own rig.

**Motion**
- **Intro:** kickstand deploys, tablet leans back, Type Cover drops open.
- **Scroll — magnetic detach.** Three overlapping phases, so the device never
  pauses between beats:
  | Phase | Progress | What moves |
  |---|---|---|
  | `present` | 0.06 → 0.26 | Cover lifts 0.85 off the desk and tilts toward the viewer |
  | `depart` | 0.24 → 0.58 | Cover tips further, rolls and drops clear of the frame |
  | `square` | 0.16 → 0.62 | Yaw eases to 0, assembly grows to 1.08× |
  | `stow` | 0.30 → 0.68 | Kickstand folds back into the chassis |

  **`present` earns the departure.** Lying flat the deck is ~71° off-axis, which
  squashes the key tops to 33% of true area — so the cover reads as a plain box
  and its exit looks like a bug. The tilt takes the deck to ~48° (67% of area)
  and grows the key field from 108px to 154px tall; it is unmistakably a
  keyboard before it leaves. The lift is not decoration: the cover pivots on its
  back edge, so tilting alone drives the front edge straight through the desk.

  **The animation must not fight the content.** A previous version folded the
  cover shut over the display, which hid the GitHub screen the hero exists to
  show. The detach is chosen because it ends with the panel square to the viewer
  and ~5% larger than at rest (588px → 618px at 1440) — scrolling *improves*
  legibility instead of destroying it.

  Intro and scroll write to the same parts without fighting: the kickstand is
  one expression, `lerp(folded, deployed, deployed × (1 − stow))`; the cover's
  intro swing and its detach travel are separate channels (rotation vs position).

- **Scroll progress comes from the hero section, not the canvas.** The canvas's
  own crossing of the viewport is already 29–37% complete at page load, varying
  by viewport, so the device would start mid-animation. The hero's
  `["start start", "end start"]` progress is reliably 0 with the page at rest.
- Pointer drives a damped lean that eases out as the device squares up. All
  disabled under reduced motion.

**Pose angles are derived, not eyeballed.** `KICK_DEPLOYED` places the
kickstand foot exactly on the desk; `COVER_CLOSED` (-1.8711 rad) is the angle
at which the cover's long axis is parallel to the leaning display. Both are
verified by trigonometry — an eyeballed `COVER_CLOSED` swung the cover straight
through the tablet.

**Camera** auto-fits on resize (`FitCamera`): it solves the distance needed to
satisfy `FIT_W` and `FIT_H` on both axes and takes the binding one, so the
framing holds at any aspect ratio.

**Sizing the device.** Three levers, in order of effect:
1. **Canvas height** — the hero device area is `70svh` on desktop and runs past
   the fold on purpose. On a wide canvas the fit is height-bound, so a short
   canvas makes the device small no matter how the fit is tuned.
2. **Camera elevation** — projected height is
   `tabletHeight·cos(e) + depth·sin(e)`, so a lower angle spends less frame on
   depth. 21° → 16°.
3. **What the fit contains.** `FIT_W`/`FIT_H` frame the *tablet*, not the whole
   assembly. The near edge of the Type Cover is allowed to run off the bottom.

That third point is the one that is easy to get wrong. Sizing the frame to
contain everything wastes ~20% of it on a keyboard edge that reads perfectly
well cropped — and the cover swings up into frame during the scroll fold
anyway. What must never crop is the tablet and the display.

Current values are the tightest that keep the tablet's top corners in frame
across 390→1920px viewports at both extremes of the pointer lean, with ~7%
margin (`worst tablet edge 0.932` in NDC). Tightening further clips the top of
the device.

**Verify fit by perspective projection, not by trigonometry.** An orthographic
estimate badly understates the near edge of the assembly, which perspective
magnifies toward the camera — it reported the cover as comfortably in frame when
it was in fact ~60% past the bottom edge.

On phones the fit is width-bound and the panel lands around 280px wide, so the
full desktop GitHub layout is not legible there. That is inherent to showing a
whole browser page on a phone-sized render, not a tuning problem.

### Swapping in a Blender model
1. Export `.glb` — **+Y up**, apply modifiers, compression on, centred on the
   origin, under ~3 MB.
2. Save to `public/models/surface.glb`.
3. Set `MODEL_URL = "/models/surface.glb"` at the top of `hero-3d-scene.tsx`.
4. Name the display mesh `Screen` in Blender so the canvas texture can be
   reattached to it by name.

The procedural Surface renders whenever `MODEL_URL` is `null`, so the site never
breaks on a missing asset.

---

## 7. Components

| Concern | Component |
|---|---|
| Section heading | `section-title.tsx` — index, kicker, masked title, self-drawing rule |
| Work / hackathon card | `project_card.tsx` — cover image, whole card is one `<Link>` |
| Detail page | `detail-page.tsx` — shared by both `/projects` and `/hackathons` |
| Nav | `navbar.tsx` — floating pill, scroll-spy, hide-on-scroll-down, mobile sheet |
| Footer | `social-links-bar.tsx` |

---

## 8. Non-negotiables

- [ ] SVG icons only (Lucide). Never emoji as UI icons.
- [ ] `cursor-pointer` on every clickable element.
- [ ] Hover changes color/opacity — **never** a transform that shifts layout.
      Scale the image inside an `overflow-hidden` frame instead.
- [ ] Interactive controls are ≥44×44px.
- [ ] Every form input has a `<label for>`; errors sit beside the field with
      `role="alert"` and `aria-describedby`.
- [ ] Icon-only buttons carry `aria-label`; decorative icons carry `aria-hidden`.
- [ ] Focus is visible via `:focus-visible` (2px ring, 2px offset).
- [ ] Both themes checked before shipping.
- [ ] Breakpoints verified at 375 / 768 / 1024 / 1440.
- [ ] `prefers-reduced-motion` honoured in CSS **and** JS.
