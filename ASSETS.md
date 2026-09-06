# World assets

The walkable world is drawn with **Modern Interiors** by LimeZu.

- Source: https://limezu.itch.io/moderninteriors
- Currently vendored: **Free version v2.2** (`Modern_Interiors_Free_v2.2`)
- Licence: `public/world-assets/LICENSE.txt`, copied verbatim from the pack

## Licence summary

The free version permits use and editing in **non-commercial projects** only. It
forbids commercial use, and forbids editing and reselling the sprites.

A personal portfolio sits in a grey area: it sells nothing, but it exists to get
its author hired. The complete pack costs **$1.20** and removes the ambiguity
entirely, so buy it before this site is promoted anywhere that could be read as
commercial. Credit LimeZu either way.

## What is vendored, and why these files

Characters in the free pack are **16x32 per frame**, so the world uses the
**16x16** tilesets to keep the classic one-tile-wide, two-tiles-tall figure. The
32x32 and 48x48 variants in the download are the same art at larger scale and are
not used.

| File in repo | From the pack |
| --- | --- |
| `public/world-assets/interiors.png` | `Interiors_free/16x16/Interiors_free_16x16.png` |
| `public/world-assets/room-builder.png` | `Interiors_free/16x16/Room_Builder_free_16x16.png` |
| `public/world-assets/characters/<Name>_<action>.png` | `Characters_free/<Name>_<action>_16x16.png` |

Characters vendored: Adam, Alex, Amelia, Bob. Actions: `idle`, `idle_anim`,
`run`, `phone`.

## Sheet layout

Every character sheet is a single row of 16x32 frames. Direction order across the
sheet is the pack standard: **right, up, left, down**.

| Sheet | Frames | Meaning |
| --- | --- | --- |
| `idle` | 4 | one per direction |
| `run` | 24 | six per direction |
| `idle_anim` | 24 | six per direction |
| `phone` | 9 | down-facing only |

## Upgrading to the paid pack

Replace the files above with the equivalents from the complete pack, keeping the
same names and the same 16x16 tile size. The complete pack's character sheets
follow the same frame order, so `world/engine/CharacterSprite.ts` needs no change.
Furniture tile indices in the map may shift, so re-check room decor after
swapping.
