# Editing the world map

The world is drawn from `public/world-assets/map.json`, a standard
[Tiled](https://www.mapeditor.org/) map. That file already exists and works: it
was generated from the grey-box floor plan by `scripts/seed-map.mjs`, so you are
editing a working map rather than starting from a blank canvas.

Open it in Tiled, make it look good, save. Nothing in the code needs to change.

> Do not re-run `scripts/seed-map.mjs` once you have started editing. It
> overwrites `map.json` and your work with it.

## The contract

The loader reads six layers **by name**. Renaming one silently removes it, so
keep these exact names.

| Layer | Type | Purpose |
| --- | --- | --- |
| `floor` | Tile | Ground. Drawn first, under everything. |
| `walls` | Tile | Walls and structure. Drawn over the floor. |
| `decor` | Tile | Furniture and props. Drawn over the walls. |
| `collision` | Object | Rectangles the player cannot walk through. |
| `anchors` | Object | Where content appears. See below. |
| `spawn` | Object | One point object named `spawn`. |

Other rules:

- **Tile size is 16x16.** The character sprites are 16x32, so a person is one
  tile wide and two tall. Changing tile size breaks that proportion.
- **Tilesets must be embedded, not external.** When adding a tileset choose
  *Embed in map*, or use *Map > Embed Tilesets* afterwards. The loader reads
  tileset data straight out of `map.json` and cannot follow a `.tsx` reference.
- Only the **file name** of a tileset image matters. Tiled may write a long
  relative path; the loader takes the last segment and serves it from
  `/world-assets/`.
- Collision is **not** inferred from wall tiles. If you draw a wall you must
  also draw a collision rectangle over it, otherwise the player walks through.

## Anchors

Anchors are point objects that say *where* content goes, never *what* it is. The
engine fills them at runtime from the arrays in `constants/pages/`, in order, so
adding a project stays a one line change with no map editing.

Give each anchor **one** custom property, a string:

| Property | Value | Meaning |
| --- | --- | --- |
| `kind` | `project` | A computer, filled from `PROJECTS` |
| `kind` | `hackathon` | A pedestal, filled from `HACKATHONS` |
| `kind` | `experience` | A desk, filled from `EXPERIENCE` |
| `kind` | `certificate` | A frame, filled from `CERTIFICATES` |
| `ref` | `npc:travis` | The greeter in the lobby |
| `ref` | `action:resume` | Downloads `/files/resume.pdf` |
| `ref` | `action:contact` | Opens the contact form |
| `ref` | `action:credits` | The LimeZu attribution plaque |
| `ref` | `action:socials` | Social links |
| `ref` | `about:portrait` | About Me, links on to `/about` |
| `ref` | `about:toolkit` | The tech stack shelf |

### How many anchors to place

More anchors than content is fine: spare ones render as empty furniture, which
reads as room to grow. **Fewer** anchors than content is a build failure, caught
by the coverage test.

| `kind` | Anchors in the seed map | Content today |
| --- | --- | --- |
| `project` | 4 | 2 |
| `hackathon` | 6 | 4 |
| `experience` | 4 | 3 |
| `certificate` | 6 | 4 |

Place an anchor where the player should *stand to interact*, roughly at the
front of the object rather than on top of it.

## Checking your work

```bash
npm run dev        # then open /world
npm test           # anchor coverage and map parsing
```
