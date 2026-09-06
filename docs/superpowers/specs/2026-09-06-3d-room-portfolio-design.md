# The 3D Room — portfolio rebuild

**Date:** 2026-09-06
**Status:** Approved design, ready for implementation planning
**Replaces:** `2026-09-05-pokemon-world-portfolio-design.md` (the PixiJS walkable world)

## 1. What this is

The portfolio becomes a single real-time 3D room, built from the *House & Office*
FBX pack, seen as a cutaway diorama. Objects in the room are the portfolio.
Clicking one glides the camera to it and slides a reader panel in beside it. The
room never goes away, and nothing ever navigates to another page.

Six sections live in the room as six visually distinct zones:

**Experience · Projects · Hackathons · Certifications · About Me · Contact Me**

There is no menu, no nav bar and no section rail. The room is the only
navigation a mouse user ever sees.

### Success criteria

1. A visitor can reach every one of the 13 content items without ever leaving `/`.
2. A visitor who has never seen the site knows all six sections exist within ten
   seconds of landing, without reading instructions.
3. A keyboard-only visitor can reach and open every interactive object.
4. A visitor without WebGL still sees every word of the portfolio.
5. Nothing on screen looks like a website navigation menu.

## 2. Scope: what dies, what lives

### Deleted

- All of `world/` — the entire PixiJS engine, content layer and React wrappers
  (~35 files).
- `app/about/`, `app/projects/[slug]/`, `app/hackathons/[slug]/`.
- `components/navbar.tsx`, `detail-page.tsx`, `reveal.tsx`, `scroll-progress.tsx`,
  `site-chrome.tsx`, `social-links-bar.tsx`, `zoomable-image.tsx`.
- The `pixi.js` dependency.
- `ASSETS.md` is rewritten for the new pack (the LimeZu notes no longer apply).

### Kept untouched

`constants/pages/*`, `constants/toolkit.ts`, `constants/contact.ts`,
`constants/media.ts`, `schemas/contact-schema.ts`, `lib/utils.ts`,
`components/ui/*`.

The content layer is already clean data with a single source per fact. The
rebuild is presentational only: no content file changes shape.

### Reworked

`components/contact-form.tsx` becomes a panel body rather than a page section.
The EmailJS wiring and the zod schema are carried over unchanged.

### Deliberately not preserved

Existing deep links (`/projects/git-dummy`) stop resolving to their own pages.
They are replaced by `/?zone=projects&item=git-dummy` in the room and by anchors
on the text version (`/text#projects-git-dummy`). This is an accepted consequence
of "no navigating to another website".

## 3. The room

### Geometry

A cutaway box: a floor, a back-left wall and a back-right wall. The two front
walls do not exist, so the camera looks in over the open corner.

Built from the pack's own architecture pieces — `floortile_office` and
`floortile_1_grey` for the floor, `wall_tile` and `wall_tile_grey_side1/2` for
the walls, `wall_tile_window` set into the back-right wall, `corner_pillar_grey`
at the join.

Positions in the scene manifest are expressed in **tile units**. A single global
scale factor is calibrated once at load from the bounding box of
`floortile_office`, so the manifest never has to carry the pack's raw model
scale. Exact furniture placement is tuned visually during implementation by
editing the manifest table; the manifest is data, not code.

### Lighting — night studio

| Light | Purpose |
|---|---|
| Ambient, deep navy, low intensity | Nothing goes fully black |
| Point light inside the `lamp` model, warm | The desk pool |
| Rect area light at the monitor, cool blue-white | Screen glow on the desk and chair |
| Point light per zone, warm, low | Makes each zone read as a lit island |
| Directional fill, very low, from the open corner | Keeps silhouettes legible |

Shadows are on with a low-resolution shadow map. Warm pools against dark
surroundings are what make low-poly models look deliberate rather than cheap,
and they are also what make the six zones legible as zones.

## 4. Zones and bindings

Each zone owns a floor area that is clickable to enter it: five sit on their own
carpet from the pack, and Contact sits on a doormat. **No two zone floors
overlap.** Experience and Certifications share the back-left wall by splitting
it — Experience takes the left half, Certifications the right half — rather than
stacking one above the other. Every binding below is data in
`room/data/scene.ts`.

### 1. EXPERIENCE — back-left wall, left half · `carpet_black`

| Object | Binds to |
|---|---|
| `file_cabinet` | All 3 `EXPERIENCE` entries, listed in the panel; the resume PDF downloads from the same panel |
| `drawer` | scenery |

### 2. PROJECTS — back-right wall · `carpet_blue`

| Object | Binds to |
|---|---|
| `computer_screen` | `PROJECTS[git-dummy]` — the monitor displays its cover image |
| `briefcase_black` | `PROJECTS[millitary-stores-telegram-bot]` (slug spelling preserved from the data) |
| `desk`, `chair`, `keyboard`, `mouse` | scenery |

Both projects are one click deep. They are the strongest work and get no
drill-down.

### 3. HACKATHONS — floor cluster, centre-right · `carpetred`

| Object | Binds to |
|---|---|
| `cartridge1`–`cartridge4` | The 4 `HACKATHONS` entries, in array order |
| `nes` | Opens the full list of 4 in the panel |
| `television`, `nes_controller`, `footrest` | scenery |

### 4. CERTIFICATIONS — back-left wall, right half · `carpetcolored`

| Object | Binds to |
|---|---|
| `painting_lighthouse`, `painting_shaman`, `painting_hyperlightdrifter`, `painting_halflife` | The 4 `CERTIFICATES` entries, in array order |
| `bookcase_small` | scenery |

### 5. ABOUT ME — front-left lounge · `carpetgreen`

| Object | Binds to |
|---|---|
| `couch_double` | `ABOUT` |
| `bookcasetall` | `TOOLKIT_ROWS` |
| `mugred` | Credits and colophon |
| `coffee_table`, `plant1`, `lamp_tall` | scenery |

Toolkit and Credits are findable objects, not sections. The About panel links
directly to the Toolkit.

### 6. CONTACT ME — back-right corner, the threshold · doormat

| Object | Binds to |
|---|---|
| `house_door` + `doorframe_house` | The contact form plus all three `CONTACT_CHANNELS` |
| `nightstand` | scenery |

The door stands ajar with warm light spilling through from the hallway beyond.
It is the only object in the room that reads as *open*, which is the right thing
for the last section to say.

### Scenery rule

Anything not in a binding table above never responds to hover or click. A hover
that highlights always means something is there.

## 5. Interaction

### Camera — three levels

```
HOME ──click a carpet──▶ ZONE ──click an object──▶ ITEM
  ◀───── Esc ──────────      ◀───── Esc ─────────
```

Escape, the panel's close button, or a click on empty floor each step back
exactly one level. There is no state from which a visitor cannot get home.

- **HOME** — the whole room framed in the open corner.
- **ZONE** — entered by clicking a zone's carpet. Camera moves into that cluster;
  the zone's light lifts and the others dim slightly.
- **ITEM** — entered by clicking a bound object. Camera glides ~600ms on an ease
  so the object sits framed in the left 55% of the viewport, and the panel slides
  in from the right. The desk monitor lights up with the open item's cover image.

### Swivel and zoom

Drag swivels within ±35° horizontal and +5°/−20° vertical, hard-clamped so the
two missing walls never rotate into view. Scroll zooms within a fixed range.
Swivel remains available at every camera level, including with a panel open.

### Hover

The object lifts ~2cm, takes a warm rim light, and a label tethers to it.
Nothing else in the room changes.

### Mobile

The panel becomes a draggable bottom sheet at 60% height, and item framing moves
the object to the top half of the viewport instead of the left. One-finger drag
swivels; pinch zooms.

## 6. Navigation without chrome

The room is the navigation. These four mechanisms replace what a nav bar would
have done, and all of them live in the world rather than on top of it.

**Establishing sweep.** On arrival the camera runs a slow pass across all six
zones, about four seconds, aborted immediately by any click, drag, scroll or
keypress. Every visitor sees every section once without being told. It then
settles into HOME. It runs once per session, not on every return to `/`.

**Floor decals.** Each carpet carries its section name rendered as 3D text lying
flat on the rug, in perspective, lit by that zone's light. Signage inside the
room, not an overlay on it.

**Idle nudge.** After ~8 seconds of no input at HOME, bound objects the visitor
has not yet opened pulse faintly. An object stops pulsing permanently once
opened. Session-scoped, not persisted.

**Keyboard navigation.** Tab cycles every bound object in fixed spatial order —
Experience → Projects → Hackathons → Certifications → About Me → Contact Me, and
within each zone in manifest order. Each Tab flies the camera to that object,
draws an in-world focus ring, and announces it through an `aria-live` region
("Experience — filing cabinet — 3 roles"). Enter opens the panel, Escape closes.
Mouse users never see any of this; keyboard users get a complete map of the room.

## 7. The panel

Slides in over the right ~45% and scrolls independently. The room stays lit,
animated and swivel-able behind it — it is never blurred, dimmed or covered.

Bodies, one per content shape:

| Body | Renders |
|---|---|
| `ProjectBody` | title, kicker, award, date, techs, links, overview, image gallery, impacts, what I did, reflection |
| `ListBody` | a section's entries as picks (used by `nes` and `file_cabinet`) |
| `ExperienceBody` | role, organisation, period, type, location, highlights, link, plus the resume download |
| `CertificateBody` | name, issuer, issued date, credential link |
| `AboutBody` | lead, sections, pull quote, disciplines, portrait, link to Toolkit |
| `ToolkitBody` | the two `TOOLKIT_ROWS` |
| `ContactBody` | the reworked EmailJS form plus all three `CONTACT_CHANNELS` |
| `CreditsBody` | asset pack credit and colophon |

**Section grouping lives here.** Any item opened from a multi-item section shows
its siblings listed alongside it under the section heading, so a visitor can move
through all four hackathons without returning to the room.

## 8. Asset pipeline

The pack is 107 binary FBX 7.4 models with 107 same-named PNG textures in
`Materials/`.

**Correction, made during implementation.** This section originally claimed the
models carry no embedded texture references. They do — each FBX names its
texture as `Materials\<name>.png`. The original check used `strings`, which is
not installed in this shell, so it returned nothing and the silence was read as
absence.

The practical consequence is smaller than it sounds, and better: FBXLoader can
resolve the textures itself once `setResourcePath("/room-assets/textures/")` is
set, so each PNG is fetched once instead of twice. Without that line every model
requests `/room-assets/models/<name>.png`, 404s, and the room renders untextured.

- Only the ~25 models the manifest actually names are vendored into
  `public/room-assets/`, not all 107.
- `useModels.ts` loads with three.js `FBXLoader`, then assigns each mesh a
  `MeshStandardMaterial` whose map is the same-named PNG.
- Textures use `NearestFilter` for both min and mag, and no mipmaps. They are
  tiny palette swatches (`desk.png` is 631 bytes at 128x128) and any smoothing
  turns them to mush.
- Loaded models are cached by name and instanced, so repeated props
  (four cartridges, four paintings) cost one load each.

### The risk, stated plainly

Runtime FBX costs roughly 150KB for the loader plus ~500KB across ~25 models.
That is acceptable but heavier than a baked GLB. Converting requires Blender or
`fbx2gltf`, neither of which is installed on this machine.

**Decision: ship runtime FBX first and measure.** If load on a mid-range phone
disappoints, adding a bake step is a contained change behind `useModels.ts` —
its callers do not change. Building a converter that may never be needed is
work done on speculation.

## 9. Fallback, SEO and URLs

`/` is client-only; a WebGL scene cannot server-render.

`/text` is a fully server-rendered page carrying **every** item, importing from
the same `constants/pages/*` the room does, so the two cannot drift. Each item
gets an anchor matching its room URL, `#<zone>-<item>` (`#projects-git-dummy`).

Visitors arrive there three ways:

1. Automatic redirect when a WebGL context cannot be created.
2. A `<noscript>` block on `/`.
3. A small permanent "text version" link in the corner of the room.

Crawlers, link previews and screen readers therefore always get real content.
`/` carries full Open Graph metadata regardless.

**URL sync.** Opening a zone sets `?zone=hackathons`; opening an item sets
`?zone=hackathons&item=fall-in`, via shallow routing. The back button steps the
camera back one level, and both zones and items are shareable links that restore
the correct camera state on load (skipping the establishing sweep when an item
is addressed directly).

## 10. Module structure

```
room/
  data/
    scene.ts        every prop: model, transform, zone, binding
    zones.ts        zone definitions, camera framings, light config
    bindings.ts     binding id to panel content, from constants/pages/*
  engine/
    useModels.ts    FBX load, texture-by-filename, cache, instancing
    Room.tsx        canvas, lights, walls, floor
    Prop.tsx        one instance: hover, click, focus ring, pulse
    CameraRig.tsx   swivel, zoom, three-level focus glide
    swivel.ts       pure - clamp drag to the cone
    focus.ts        pure - object bounds plus level to camera target
    tabOrder.ts     pure - spatial keyboard order
    attract.ts      pure - the establishing sweep path
  ui/
    Panel.tsx       side panel / bottom sheet
    ZoneDecal.tsx   in-world floor lettering
    bodies/*.tsx    one per content shape (see section 7)
  fallback/
    TextSite.tsx
```

`scene.ts` and `zones.ts` are tables, not code. Repositioning the room is editing
data, and a wrong binding fails a test rather than shipping.

## 11. Testing

vitest is already configured.

- `swivel.ts` — clamping at and beyond both limits, on both axes.
- `focus.ts` — camera target for each of the three levels, and that item framing
  leaves the left 55% clear on desktop and the top half on mobile.
- `tabOrder.ts` — order matches the six-section sequence; every bound object
  appears exactly once.
- `attract.ts` — the sweep path visits all six zones and terminates at HOME.
- **Coverage test** — every content item in `constants/pages/*` has exactly one
  binding, and every binding in the manifest resolves to real content. This is
  the guard `world/content/coverage.test.ts` provides today and it is the single
  most valuable test in the suite; it is carried over.
- **Manifest test** — every model named in `scene.ts` exists in
  `public/room-assets/` with its matching PNG.

## 12. Dependencies

**Added:** `three`, `@react-three/fiber`, `@react-three/drei`.
**Removed:** `pixi.js`.

R3F v9 supports React 19, which this project is on.

## 13. Performance budget

| Item | Budget |
|---|---|
| three + R3F + drei, gzipped | ~600KB |
| FBXLoader | ~150KB |
| ~25 models + PNGs | ~520KB |
| Time to first interactive frame, mid-range phone | under 4s |
| Steady frame rate, mid-range phone | 30fps or better |

If the last two are missed, the GLB bake in section 8 is the first lever.

## 14. Explicitly out of scope

- Walking, an avatar, or any character model. The pack contains none.
- Full 360° orbit. The back of the room is not art-directed.
- A day/night toggle. Considered and dropped; night only.
- Multiple rooms or a house. One room.
- Persisting visited state across sessions.
- Building an FBX to GLB converter before it is shown to be needed.
