# Travis Ang — portfolio

A portfolio you walk around instead of scroll. The homepage is a real-time 3D
cutaway bedroom; the six sections of a CV are six places in it, and clicking an
object opens a reader panel beside the room rather than navigating away.

`/` is the only content route. `/text` carries the same content as plain HTML
for anyone whose browser cannot give us a WebGL context — they are redirected
there automatically.

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Next dev server                               |
| `npm run build`   | Production build                              |
| `npm start`       | Serve the production build                    |
| `npm run lint`    | ESLint (`eslint-config-next`)                 |
| `npm test`        | Vitest, once                                  |
| `npm run test:watch` | Vitest, watching                           |

## Layout

```
app/            Routes. `/` is the room, `/text` is the no-WebGL fallback.
room/
  data/         The room as data — zones, prop manifest, model list, content bindings
  engine/       three.js / R3F: camera framing, swivel clamping, props, mounting
  ui/           The reader panel, signs, dock, welcome screen and section bodies
  fallback/     WebGL probe and the text site
constants/      The portfolio content itself — projects, hackathons, experience, about
components/ui/  shadcn primitives
scripts/        Puppeteer drivers used to check the room in a real browser
docs/           Design specs and the implementation plan
public/room-assets/  Vendored FBX models and their textures
```

### Where the content lives

Everything the site says about a project, hackathon, role or certificate comes
from `constants/`. To add a project, append to `PROJECTS` in
`constants/pages/projects.ts` — nothing else needs a new file.
`room/data/bindings.ts` maps that content onto the objects in the room, and
`room/data/bindings.test.ts` fails if a section ends up with nothing to show.

### What the tests cover

The room's logic — camera framing, swivel clamping, tab order, the reader
rectangle, the state store — is deliberately pure TypeScript with no React and
no DOM, so it is unit-tested in a plain node environment. Anything that touches
three.js or the browser is checked by driving a real Chrome with the scripts in
`scripts/`, not by mocking a renderer.

## Assets

The room is built from the **House & Office** pack by francoface. See
[ASSETS.md](ASSETS.md) for what is vendored, how to re-vendor it, and two
non-obvious things about the pack that will otherwise cost you an afternoon.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui ·
three.js via React Three Fiber and drei · Vitest · EmailJS + Zod for the contact
form.
