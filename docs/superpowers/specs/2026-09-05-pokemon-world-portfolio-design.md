# Walkable World Portfolio — Design

**Date:** 2026-09-05
**Status:** Approved, pending implementation plan
**Supersedes:** the scrolling one-page portfolio in `components/home-content.tsx`

## Summary

Replace the scrolling homepage with a top-down pixel-art interior that visitors
walk around. Each room is a section of the portfolio; each interactable object is
one entry from the existing content data. Walking to a project's computer and
pressing E opens a dialogue box; pressing R opens the real detail page that
already exists today.

The content layer is not being rebuilt. `constants/pages/*.ts`, the
`app/projects/[slug]` and `app/hackathons/[slug]` templates, the contact form and
EmailJS all survive unchanged. This rebuild replaces the presentation only.

## Goals

- The homepage is a walkable world, on desktop and on phones.
- Adding a project stays a one-line change: append to the `PROJECTS` array.
- The site remains crawlable, screen-readable, and useful with no WebGL.
- Nothing already written is lost. Long-form content keeps its real pages.

## Non-goals

- Multiple maps, outdoor areas, routes or towns. One interior floor.
- Audio. Explicitly cut.
- Multiplayer, persistence, or any backend beyond the existing EmailJS form.
- A second "classic view" homepage. The detail pages plus the semantic fallback
  list cover that need without a parallel site to maintain.

## Stack decision

**PixiJS v8 renderer + Tiled map editor + React/Next for all UI.**

Rejected alternatives:

- **Phaser 3** — pulls UI inside the canvas, which forfeits the existing design
  system and accessibility, and adds ~1MB of framework with an SSR-hostile scene
  lifecycle.
- **Hand-rolled Canvas2D** — viable at this scale and ~300KB lighter, but
  requires reimplementing texture atlases, batching and culling, and loses
  correspondence with the reference implementation.

Pixi is a renderer rather than a framework, so React keeps ownership of every
piece of UI. The dialogue box, HUD, and contact modal are real DOM: accessible,
Tailwind-styled, and visually consistent with the detail pages.

Reference implementation: `damientjk/dannypp`, `apps/web/src/world/` — same
stack (Pixi + Tiled `map.json` + LimeZu 32x64 character sheets).

### Dependencies

Added: `pixi.js` v8, `vitest`.

Removed: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.
These exist only for the 3D Surface Pro hero that the world replaces. Deleting
them also removes `components/device-hero.tsx`, `components/device-scene.tsx`,
`lib/screen-chrome.ts` and `lib/github-screen.ts`.

## Art assets and licensing

Assets are **LimeZu "Modern Interiors"** (https://limezu.itch.io/moderninteriors),
the same pack used by the reference repo.

Three licence constraints drive real decisions:

1. **The free tier is insufficient.** It is licensed for private/testing use only
   and contains roughly 3% of the pack. A public portfolio is not private use.
   The full pack is name-your-own-price with a **$1.50 minimum**, which permits
   commercial use.
2. **Attribution is required.** A link to `limezu.itch.io` appears in two places:
   the site footer and an in-world credits plaque in the lobby.
3. **Redistribution is prohibited.** This repository is public
   (`BruhClient/Developer-Portfolio-Website`), so the raw sheets must not be
   committed. `public/world-assets/` is gitignored; an `ASSETS.md` at the repo
   root documents which pack to buy and where to place the files; the assets are
   uploaded directly to the host.

The site must degrade legibly when assets are absent, never render a black
canvas. See "Accessibility, SEO, and failure modes".

## Floor plan

One interior, six spaces off a central corridor. Spawn is the lobby.

```
        +----------+----------+----------+
        | PROJECTS |  TROPHY  |   WORK   |
        |  [pc][pc]|  [Y][Y]  | [desk]   |
        |  [pc][pc]|  [*Y*][Y]| [certs]  |
        +----^-----+----^-----+----^-----+
    ====================================== corridor
        +----v-----+----------+----v-----+
        |  ABOUT   |  LOBBY   | CONTACT  |
        | portrait |   @ NPC  | [phone]  |
        | [resume] |  spawn   | [socials]|
        +----------+----------+----------+
```

| Room | Content source | Interactables |
| --- | --- | --- |
| Lobby | static | NPC-Travis (greeting + controls), credits plaque |
| About | `components/about-me.tsx` copy, `constants/media.ts` | wall portrait, toolkit shelf, filing cabinet to `/files/resume.pdf` |
| Projects | `PROJECTS` | one computer per project |
| Trophy | `HACKATHONS` | one pedestal per hackathon; entries with `award` get a spotlight |
| Work | `EXPERIENCE`, `CERTIFICATES` | one desk per role, framed certificate per credential |
| Contact | `constants/contact.ts` | desk phone opens the contact modal, social link objects |

### Rooms declare slots, not content

Tiled object layers define **empty anchors** — four desk positions in Projects,
six pedestal positions in Trophy, and so on. At runtime the engine fills anchors
in array order from the content data.

This is the central design constraint. Adding a project remains exactly what
`memory/MEMORY.md` documents today: append an entry to `PROJECTS`. No map
editing, no new files, no coordinates in code.

Anchors carry a `kind` property (`project`, `hackathon`, `experience`,
`certificate`). Static objects carry an explicit `ref` (`action:resume`,
`action:contact`, `npc:travis`, `action:credits`).

Anchor counts are fixed by the map and deliberately exceed current content, so
the next few additions need no map edit:

| Room | Anchor kind | Anchors | Used today |
| --- | --- | --- | --- |
| Projects | `project` | 4 | 2 |
| Trophy | `hackathon` | 6 | 4 |
| Work | `experience` | 4 | 3 |
| Work | `certificate` | 6 | 4 |

Unfilled anchors render as empty furniture (a vacant desk, a bare pedestal), not
as gaps in the floor.

## Architecture

```
world/
  engine/            pure TS. No React, no DOM.
    TiledMap.ts      parse Tiled JSON, build tile layers, expose object layers
    Camera.ts        follow target, clamp to map bounds, zoom
    Collision.ts     AABB player vs collision rects, axis-separated resolution
    CharacterSprite.ts  frame slicing + idle/run animation state machine
    Interaction.ts   nearest interactable in facing direction within radius
    Input.ts         keyboard + touch to normalised direction vector
    loop.ts          fixed-timestep update
  content/
    slots.ts         fill anchors from content arrays, in order
    refs.ts          ref string to content entry resolution
    dialogue.ts      content entry to dialogue beats
  react/
    WorldCanvas.tsx  mounts Pixi, owns app lifecycle and asset loading
    DialogueBox.tsx  DOM textbox, typewriter, beat paging
    Hud.tsx          room label, controls hint, touch d-pad
    ContactModal.tsx wraps the existing contact form
    WorldFallback.tsx semantic interactable list
```

`engine/` and `content/` are pure and unit-testable headless. Pixi rendering is
verified visually, not by test.

## Behaviour

**Movement.** Free 2D movement with AABB collision, not tile-locked stepping.
Tile-locking is more faithful to Pokemon but feels stiff under a touch d-pad and
fights diagonal input. LimeZu's 6-frame directional run cycles assume free
movement.

**Interaction.** The engine selects the nearest interactable within roughly 40px
in the player's facing direction and floats an `E` prompt above it. E opens the
dialogue box: two or three beats of text with a typewriter reveal, E advances
beats, R (or the on-screen button) navigates to the entry's detail page.

Dialogue beats per kind:

- project / hackathon — `overview`, then `cardTechs ?? techs`, then `award` if present
- experience — `role` at `organisation`, `period`, then each entry in `highlights`
- certificate — `name`, `issuer`, `issued`
- npc / credits / resume / contact — static copy

**Not every kind has a detail page.** Only projects and hackathons have
`/[slug]` routes. The read-more affordance resolves per kind:

| Kind | R action |
| --- | --- |
| project, hackathon | internal navigation to `/projects/<slug>` or `/hackathons/<slug>` |
| experience | external link if `link` is set, otherwise no affordance |
| certificate | external link if `credentialUrl` is set, otherwise no affordance |
| resume | downloads `/files/resume.pdf` |
| contact | opens the contact modal |
| npc, credits | no affordance; credits links out to `limezu.itch.io` |

When there is no affordance the dialogue box shows no R hint, so the prompt never
advertises an action that does nothing. Experience and certificate entries are
therefore fully readable in-world — their dialogue carries the complete content,
because there is no page to defer to.

**Returning.** Player position, facing and room are written to `sessionStorage`
on navigation away. Browser-back restores them, so leaving for a project page and
returning does not respawn the player in the lobby.

**Deep links.** `/?room=trophy` spawns the player at that room's entrance.

**Mobile.** The world runs on phones. A translucent d-pad sits bottom-left and an
A button bottom-right. Camera zoom increases on narrow viewports so a room still
reads at phone width. Touch input feeds the same direction vector as the keyboard.

**Reduced motion.** `prefers-reduced-motion` disables ambient object animation and
the typewriter reveal; text appears complete.

**Loading.** A pixel-art progress screen driven by Pixi's asset-bundle progress
callback. One texture atlas, offscreen tile culling, fixed 60Hz timestep,
`devicePixelRatio` capped at 2.

## Accessibility, SEO, and failure modes — one mechanism

Beneath the canvas sits a real semantic list of every interactable: every
project, hackathon, role and certificate. Entries that have a destination render
as `<a>` (projects and hackathons to their detail pages, certificates to
`credentialUrl`, experience to `link`); entries with no destination render their
full dialogue content inline as text, so nothing is reachable only by walking.

- **Visually hidden by default** — present for screen readers and crawlers, so the
  homepage is navigable and indexable without WebGL.
- **Unhidden on failure** — if asset loading fails, WebGL is unavailable, or the
  Pixi app throws during init, the canvas is removed and the list is shown as a
  plain styled portfolio.

This covers accessibility, SEO, the missing-assets case for anyone cloning the
repo, and blocked-WebGL environments with a single implementation rather than
four.

## Testing

Vitest over `engine/` and `content/`:

- collision resolution, including corners against two adjacent rects
- camera clamping at all four map edges and at zoom extremes
- character frame slicing against the documented 32x64 sheet layout
- facing-direction interaction selection, including ties and out-of-range
- slot filling order and ref resolution
- `sessionStorage` restore round-trip

**Content coverage guard.** A test asserts that every entry in `PROJECTS`,
`HACKATHONS`, `EXPERIENCE` and `CERTIFICATES` resolves to an anchor, and that no
room holds more content than it has anchors. Adding a fifth project to a
four-desk room fails the build with a clear message rather than silently
dropping the project from the site.

Pixi rendering, art fidelity and feel are verified by looking at the running app.

## Milestones

Each is independently reviewable and leaves the site in a working state.

1. **Grey-box** — placeholder rectangles, movement, collision, camera, loop.
   Playable and worth reviewing before any art exists.
2. **Art** — Tiled map, LimeZu tileset, character animation state machine.
3. **Content** — anchors, slot filling, dialogue box, read-more navigation,
   semantic fallback list, sessionStorage restore, deep links.
4. **Mobile** — touch d-pad, A button, responsive zoom.
5. **Life** — NPC-Travis, ambient animated objects, trophy spotlight for entries
   with an `award`.
6. **Cleanup** — remove three.js and the device-hero subsystem, footer and
   in-world credits, `ASSETS.md`, gitignore `public/world-assets/`, deploy.

## Open risks

- **Art authoring time is the real schedule risk.** Placing furniture in Tiled to
  a standard worth showing is hours of design work, not minutes, and it is not
  work the engine milestones can hide. Milestone 2 should be timeboxed and
  reviewed early.
- **Room capacity is fixed by the map.** Six pedestals means a seventh hackathon
  requires opening Tiled. The coverage guard makes this a loud failure rather
  than a silent one, which is the right trade, but it is not zero-maintenance.
