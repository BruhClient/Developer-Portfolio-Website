import type { Vec3 } from "../engine/focus";
import type { MountKind } from "../engine/mount";
import type { ModelName } from "./models";
import type { ZoneId } from "./zones";

/*
  Every object in the room, as a table.

  `binding` is what makes a prop interactive. A prop without one is scenery: it
  never highlights, never takes a click, and never appears in the Tab order.
  That is the scenery rule, and keeping it a single optional field means it
  cannot be half-applied.
*/
export interface Prop {
  id: string;
  model: ModelName;
  zone: ZoneId;
  position: Vec3;
  /** Degrees. */
  rotationY: number;
  scale?: number;
  /**
    Set on wall-hung art only. The pack models paintings lying flat, so they
    need a tilt before a yaw means anything - see engine/mount.ts. Absent means
    the prop stands on the floor and `rotationY` alone places it.
  */
  mount?: MountKind;
  /** Multiplies the model's texture. Used to colour the pack's white walls. */
  tint?: string;
  /** Binding id resolved by room/data/bindings.ts. Absent means scenery. */
  binding?: string;
  /*
    This object is WHERE a piece of content lives, without being a way in to it.

    Exactly six objects are clickable - one per section - because twelve
    scattered entry points gave a visitor no sense of what belonged with what.
    The rest of the content is picked from a list inside the panel, and when it
    is, the camera flies to the object named here: choose a certificate and the
    room turns to that frame on the wall, choose a hackathon and it turns to
    that cartridge on the floor. So the room still holds every item, and
    browsing the panel is what moves you through it.
  */
  anchorFor?: string;
}

/*
  The room's footprint, in tiles, where one tile is one metre.

  Five. It was ten, which was a warehouse, then seven, which was still a room
  with a lot of nothing in the middle. The look this is chasing is a doll's
  house - furniture along every wall and barely enough floor left to stand on -
  and you cannot light or decorate your way to that from a big empty box. A
  small room is the thing that makes it read as lived in.
*/
export const ROOM = { size: 5, half: 2.5 } as const;

/*
  The inner face of a wall, measured rather than assumed: a wall tile centred on
  -HALF spans a quarter of a tile either side of it, so anything hung on that
  wall has to sit at -2.38 or nearer the middle of the room. Two rounds of art
  vanishing into the plaster came from picking a number by eye instead.
*/
export const WALL_FACE = -2.36;

/*
  The pack's walls are near-white, which under a bright cartoon wash blows out
  to a flat glare and swallows the art hung on it. Tinting them cool leaves the
  warm floor and the lamps somewhere to sit against.
*/
const WALL_TINT = "#aab4cd";

/*
  Walls, generated rather than hand-listed.

  A wall_tile measures one tile across, so a five-tile wall is five of them.
  That is a loop, not ten rows of coordinates nobody will read - and it means
  changing ROOM.size moves the walls with it instead of leaving them stranded
  mid-air.

  Unrotated, a wall tile is thin along x, so it runs along z. The left wall
  takes it as-is; the back wall turns it 90 degrees. One model serves both,
  because the grey variant stands 2.55 tall against wall_tile's 2.20 and mixing
  the two gave the room two different ceiling heights.
*/
function buildWalls(): Prop[] {
  const walls: Prop[] = [];

  for (let i = 0; i < ROOM.size; i++) {
    const offset = -ROOM.half + 0.5 + i;

    walls.push({
      id: `wall:left-${i}`,
      model: "wall_tile",
      zone: offset < -1 ? "certifications" : "about",
      position: { x: -ROOM.half, y: 0, z: offset },
      rotationY: 0,
      tint: WALL_TINT,
    });

    // One bay of the back wall is the window, over the desk.
    const isWindow = offset > -1.5 && offset < -0.5;
    walls.push({
      id: `wall:back-${i}`,
      model: isWindow ? "wall_tile_window" : "wall_tile",
      zone: offset > 0.5 ? "contact" : "projects",
      position: { x: offset, y: 0, z: -ROOM.half },
      rotationY: 90,
      tint: WALL_TINT,
    });
  }

  /*
    No corner pillar. The pack's is 2.55 tall against wall_tile's 2.20, so it
    stood proud of both walls and read as a chimney growing out of the corner.
    Two tiles meeting at right angles close the corner on their own.
  */
  return walls;
}

/** Walls. The floor is laid tile by tile in engine/Floor.tsx, not here. */
export const ARCHITECTURE: readonly Prop[] = buildWalls();

/*
  The floor plan, looking in over the open corner: -x is the left wall, -z is
  the back wall, +x/+z is the open front.

  Everything hugs a wall. In a five-tile room that is not a style choice - it is
  the only way six sections fit - but it is also how small rooms actually get
  arranged, and it leaves the middle clear so the camera always has something to
  look across.
*/
export const SCENE: readonly Prop[] = [
  // ---------------------------------------------------------------- PROJECTS
  // The desk juts out from the back wall under the window, which is where the
  // window bay lands at ROOM.size 5. This is the heart of the room, so it gets
  // the lamp, the speakers and the mugs nobody has washed.
  { id: "projects:desk", model: "desk", zone: "projects", position: { x: -0.85, y: 0, z: -1.85 }, rotationY: 0 },
  { id: "projects:chair", model: "chair", zone: "projects", position: { x: -0.85, y: 0, z: -0.95 }, rotationY: 180 },
  { id: "projects:monitor", model: "computer_screen", zone: "projects", position: { x: -1.0, y: 0.75, z: -2.0 }, rotationY: 0, binding: "projects", anchorFor: "project:git-dummy" },
  { id: "projects:keyboard", model: "keyboard", zone: "projects", position: { x: -0.9, y: 0.75, z: -1.63 }, rotationY: 0 },
  { id: "projects:mouse", model: "mouse", zone: "projects", position: { x: -0.43, y: 0.75, z: -1.63 }, rotationY: 0 },
  { id: "projects:lamp", model: "lamp", zone: "projects", position: { x: -1.5, y: 0.75, z: -1.97 }, rotationY: 0 },
  { id: "projects:speaker-l", model: "speaker", zone: "projects", position: { x: -1.3, y: 0.75, z: -1.99 }, rotationY: 15 },
  { id: "projects:speaker-r", model: "speaker2", zone: "projects", position: { x: -0.32, y: 0.75, z: -1.99 }, rotationY: -15 },
  { id: "projects:cup", model: "cupblue", zone: "projects", position: { x: -0.15, y: 0.75, z: -1.78 }, rotationY: 0 },
  { id: "projects:briefcase", model: "briefcase_black", zone: "projects", position: { x: 0.1, y: 0, z: -1.35 }, rotationY: -25, anchorFor: "project:millitary-stores-telegram-bot" },
  { id: "projects:blinds", model: "blinds", zone: "projects", position: { x: -1.0, y: 1.78, z: WALL_FACE }, rotationY: 90 },

  // ---------------------------------------------------------- CERTIFICATIONS
  // Framed two-up on the back end of the left wall, above a low shelf.
  { id: "certifications:frame-1", model: "painting_lighthouse", zone: "certifications", position: { x: WALL_FACE, y: 1.72, z: -1.95 }, rotationY: 0, mount: "wall-left", binding: "certifications", anchorFor: "certificate:0" },
  { id: "certifications:frame-2", model: "painting_shaman", zone: "certifications", position: { x: WALL_FACE, y: 1.72, z: -1.15 }, rotationY: 0, mount: "wall-left", anchorFor: "certificate:1" },
  { id: "certifications:frame-3", model: "painting_hyperlightdrifter", zone: "certifications", position: { x: WALL_FACE, y: 1.02, z: -1.95 }, rotationY: 0, mount: "wall-left", anchorFor: "certificate:2" },
  { id: "certifications:frame-4", model: "painting_halflife", zone: "certifications", position: { x: WALL_FACE, y: 1.02, z: -1.15 }, rotationY: 0, mount: "wall-left", anchorFor: "certificate:3" },
  { id: "certifications:shelf", model: "bookcase_small", zone: "certifications", position: { x: -2.2, y: 0, z: -1.95 }, rotationY: 90 },
  { id: "certifications:plant", model: "plant3", zone: "certifications", position: { x: -2.2, y: 0, z: -2.3 }, rotationY: 0 },

  // -------------------------------------------------------------- EXPERIENCE
  { id: "experience:cabinet", model: "file_cabinet", zone: "experience", position: { x: -2.15, y: 0, z: -0.55 }, rotationY: 90, binding: "experience" },
  { id: "experience:drawer", model: "drawer", zone: "experience", position: { x: -2.15, y: 0, z: -1.3 }, rotationY: 90 },
  { id: "experience:cup", model: "cupred", zone: "experience", position: { x: -2.15, y: 0.62, z: -0.55 }, rotationY: 0 },

  // ---------------------------------------------------------------- ABOUT ME
  // The bed is what turns this from an office into someone's room, and it is
  // the honest object to hang "about me" on. It is 1.10 long and 0.58 wide, so
  // it runs along the left wall rather than across it.
  { id: "about:bed", model: "bedsingle", zone: "about", position: { x: -2.05, y: 0, z: 0.85 }, rotationY: 0, binding: "about" },
  { id: "about:nightstand", model: "nightstand", zone: "about", position: { x: -2.15, y: 0, z: 1.65 }, rotationY: 90 },
  { id: "about:mug", model: "mugred", zone: "about", position: { x: -2.2, y: 0.5, z: 1.6 }, rotationY: 0, anchorFor: "credits" },
  { id: "about:bookcase", model: "bookcasetall", zone: "about", position: { x: -2.1, y: 0, z: 2.15 }, rotationY: 90, anchorFor: "toolkit" },
  { id: "about:lamp-tall", model: "lamp_tall", zone: "about", position: { x: -1.35, y: 0, z: 1.7 }, rotationY: 0 },
  { id: "about:plant", model: "plant1", zone: "about", position: { x: -1.1, y: 0, z: 2.25 }, rotationY: 0 },
  // Clothes on the floor. Nobody's room is tidy at 2am.
  { id: "about:shirt", model: "shirt", zone: "about", position: { x: -1.4, y: 0, z: 0.65 }, rotationY: 35 },
  { id: "about:sock", model: "sock", zone: "about", position: { x: -1.15, y: 0, z: 1.0 }, rotationY: -20 },

  // -------------------------------------------------------------- HACKATHONS
  { id: "hackathons:table", model: "table_small", zone: "hackathons", position: { x: 1.9, y: 0, z: 0.4 }, rotationY: 0, scale: 1.7 },
  // The pack authors the screen facing -Z, so 180 is what turns it to the open
  // corner. Measured with four test sets on the floor, one per quarter turn,
  // after guessing at 215 and 35 and getting an edge-on black shard both times.
  { id: "hackathons:tv", model: "television", zone: "hackathons", position: { x: 1.9, y: 0.82, z: 0.4 }, rotationY: 180 },
  { id: "hackathons:nes", model: "nes", zone: "hackathons", position: { x: 1.75, y: 0, z: 1.25 }, rotationY: 215, binding: "hackathons" },
  { id: "hackathons:controller", model: "nes_controller", zone: "hackathons", position: { x: 1.15, y: 0, z: 1.5 }, rotationY: 170 },
  { id: "hackathons:footrest", model: "footrest", zone: "hackathons", position: { x: 2.15, y: 0, z: 1.45 }, rotationY: 0 },
  /*
    Cartridges out of their boxes, scattered the way they actually end up.

    Not doors, but not dead either. They each opened one hackathon directly,
    which made the pile five clickable things saying almost the same thing and
    gave a visitor no sense that the four belonged together. The console opens
    the group; choosing an entry from that list turns the room to its cartridge.
  */
  { id: "hackathons:cart-1", model: "cartridge1", zone: "hackathons", position: { x: 0.85, y: 0, z: 1.15 }, rotationY: 12, anchorFor: "hackathon:0" },
  { id: "hackathons:cart-2", model: "cartridge2", zone: "hackathons", position: { x: 1.05, y: 0, z: 1.9 }, rotationY: -18, anchorFor: "hackathon:1" },
  { id: "hackathons:cart-3", model: "cartridge3", zone: "hackathons", position: { x: 0.7, y: 0, z: 1.7 }, rotationY: 30, anchorFor: "hackathon:2" },
  { id: "hackathons:cart-4", model: "cartridge4", zone: "hackathons", position: { x: 1.45, y: 0, z: 2.15 }, rotationY: -6, anchorFor: "hackathon:3" },
  { id: "hackathons:plant", model: "plant2", zone: "hackathons", position: { x: 2.3, y: 0, z: -0.35 }, rotationY: 0 },

  // ------------------------------------------------------------- CONTACT ME
  { id: "contact:doorframe", model: "doorframe_house", zone: "contact", position: { x: 1.6, y: 0, z: -2.46 }, rotationY: 90 },
  { id: "contact:door", model: "house_door", zone: "contact", position: { x: 1.3, y: 0, z: -2.3 }, rotationY: 118, binding: "contact" },

  // ------------------------------------------------ Personality, on the walls
  // Wall art is mounted, not rotated - see engine/mount.ts for why a yaw alone
  // leaves a painting lying flat in mid-air.
  // The game posters are scenery on purpose: they say who lives here without
  // pretending to be another portfolio item to click.
  { id: "poster:mario", model: "painting_mario", zone: "projects", position: { x: 0.25, y: 1.8, z: WALL_FACE }, rotationY: 0, mount: "wall-back" },
  { id: "poster:pokeball", model: "painting_pokeball", zone: "contact", position: { x: 0.75, y: 1.35, z: WALL_FACE }, rotationY: 0, mount: "wall-back" },
  { id: "poster:squirtle", model: "painting_squirtle", zone: "about", position: { x: WALL_FACE, y: 1.7, z: 0.85 }, rotationY: 0, mount: "wall-left" },

  /*
    A shelf and the things on it. `bookshelf` is a wall shelf in this pack - a
    board 1.02 wide and 0.28 tall - so it hangs rather than stands; on the floor
    it read as a plank someone had dropped.
  */
  { id: "clutter:bookshelf", model: "bookshelf", zone: "projects", position: { x: 0.4, y: 1.15, z: -2.2 }, rotationY: 90 },
  { id: "clutter:book-blue", model: "bookblue", zone: "projects", position: { x: -0.6, y: 0.75, z: -1.92 }, rotationY: 8 },
  { id: "clutter:book-red", model: "bookred", zone: "projects", position: { x: -0.6, y: 0.79, z: -1.93 }, rotationY: -6 },
  { id: "clutter:book-green", model: "bookgreen", zone: "about", position: { x: -2.05, y: 0.54, z: 1.72 }, rotationY: 14 },
  { id: "clutter:book-orange", model: "bookorange", zone: "certifications", position: { x: -2.2, y: 0.66, z: -1.95 }, rotationY: -10 },
  { id: "clutter:mug-2", model: "muglightred", zone: "projects", position: { x: 0.62, y: 1.43, z: -2.2 }, rotationY: 0 },

];

/** Every prop that responds to hover, click and Tab. */
export const INTERACTIVE: readonly Prop[] = SCENE.filter((p) => p.binding);
