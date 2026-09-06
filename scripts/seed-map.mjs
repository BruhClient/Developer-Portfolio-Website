/*
  Generates a starting Tiled map from the grey-box floor plan.

  This exists so the map does not have to be drawn from a blank canvas: it emits
  correct layers, collision and content anchors, and is then opened in Tiled and
  made to look good by hand. Re-running it OVERWRITES public/world-assets/map.json,
  so do not run it once real editing has started.
*/
import fs from "node:fs";

const TILE = 16;
const COLS_RB = 17; // room-builder.png is 17 tiles wide

const ROWS = fs
  .readFileSync("world/map/greybox.ts", "utf8")
  .match(/^  "([.#@]+)",$/gm)
  .map((line) => line.slice(3, -2));

const W = ROWS[0].length;
const H = ROWS.length;

const gidRB = (c, r) => 1 + r * COLS_RB + c;
const isWall = (c, r) => ROWS[r]?.[c] === "#";
const isCorridorRow = (r) => r >= 8 && r <= 10;

// Same choices as world/engine/TilePicker.ts.
const FLOOR = { room: { c: 11, r: 11 }, corridor: { c: 14, r: 11 } };
const WALL_TOP = { c: 12, r: 0 };
const WALL_FACE = { c: 14, r: 0 };

const floor = [];
const walls = [];
for (let r = 0; r < H; r += 1) {
  for (let c = 0; c < W; c += 1) {
    const block = FLOOR[isCorridorRow(r) ? "corridor" : "room"];
    floor.push(gidRB(block.c + (c % 3), block.r + (r % 2)));
    if (isWall(c, r)) {
      const ref = isWall(c, r + 1) ? WALL_TOP : WALL_FACE;
      walls.push(gidRB(ref.c, ref.r));
    } else {
      walls.push(0);
    }
  }
}

// One collision rectangle per horizontal run of wall, rather than per tile, so
// the map opens in Tiled with a handful of editable boxes instead of hundreds.
const collision = [];
for (let r = 0; r < H; r += 1) {
  let start = null;
  for (let c = 0; c <= W; c += 1) {
    if (isWall(c, r)) {
      if (start === null) start = c;
    } else if (start !== null) {
      collision.push({
        id: collision.length + 1,
        x: start * TILE,
        y: r * TILE,
        width: (c - start) * TILE,
        height: TILE,
        name: "",
        visible: true,
        rotation: 0,
      });
      start = null;
    }
  }
}

const anchors = [];
let anchorId = 1000;
const point = (col, row, name, props) => {
  anchors.push({
    id: (anchorId += 1),
    x: col * TILE + TILE / 2,
    y: row * TILE + TILE / 2,
    width: 0,
    height: 0,
    name,
    point: true,
    visible: true,
    rotation: 0,
    properties: Object.entries(props).map(([k, v]) => ({
      name: k,
      type: "string",
      value: v,
    })),
  });
};

// Projects room, top left: four desks.
[2, 5, 8, 11].forEach((c, i) => point(c, 2, `project-${i + 1}`, { kind: "project" }));
// Trophy hall, top middle: six pedestals.
[15, 17, 19, 21, 23, 25].forEach((c, i) =>
  point(c, 3, `hackathon-${i + 1}`, { kind: "hackathon" }),
);
// Work room, top right: four desks and six certificate frames.
[28, 31, 34, 37].forEach((c, i) =>
  point(c, 2, `experience-${i + 1}`, { kind: "experience" }),
);
[28, 30, 32, 34, 36, 38].forEach((c, i) =>
  point(c, 5, `certificate-${i + 1}`, { kind: "certificate" }),
);
// About room, bottom left.
point(3, 13, "portrait", { ref: "about:portrait" });
point(7, 13, "toolkit", { ref: "about:toolkit" });
point(11, 13, "resume-cabinet", { ref: "action:resume" });
// Lobby, bottom middle.
point(18, 13, "travis", { ref: "npc:travis" });
point(22, 13, "credits-plaque", { ref: "action:credits" });
// Contact room, bottom right.
point(31, 13, "desk-phone", { ref: "action:contact" });
point(35, 13, "socials", { ref: "action:socials" });

const layer = (name, data, id) => ({
  id,
  name,
  type: "tilelayer",
  data,
  width: W,
  height: H,
  x: 0,
  y: 0,
  opacity: 1,
  visible: true,
});

const map = {
  compressionlevel: -1,
  width: W,
  height: H,
  tilewidth: TILE,
  tileheight: TILE,
  infinite: false,
  orientation: "orthogonal",
  renderorder: "right-down",
  type: "map",
  version: "1.10",
  tiledversion: "1.10.2",
  nextlayerid: 10,
  nextobjectid: anchorId + 1,
  tilesets: [
    {
      firstgid: 1,
      name: "room-builder",
      image: "room-builder.png",
      imagewidth: 272,
      imageheight: 368,
      tilewidth: TILE,
      tileheight: TILE,
      columns: COLS_RB,
      tilecount: 391,
      margin: 0,
      spacing: 0,
    },
    {
      firstgid: 392,
      name: "interiors",
      image: "interiors.png",
      imagewidth: 256,
      imageheight: 1424,
      tilewidth: TILE,
      tileheight: TILE,
      columns: 16,
      tilecount: 1424,
      margin: 0,
      spacing: 0,
    },
  ],
  layers: [
    layer("floor", floor, 1),
    layer("walls", walls, 2),
    layer("decor", new Array(W * H).fill(0), 3),
    { id: 4, name: "collision", type: "objectgroup", objects: collision, opacity: 1, visible: true, x: 0, y: 0, draworder: "topdown" },
    { id: 5, name: "anchors", type: "objectgroup", objects: anchors, opacity: 1, visible: true, x: 0, y: 0, draworder: "topdown" },
    {
      id: 6,
      name: "spawn",
      type: "objectgroup",
      draworder: "topdown",
      opacity: 1,
      visible: true,
      x: 0,
      y: 0,
      objects: [{ id: 999, name: "spawn", x: 19 * TILE + TILE / 2, y: 15 * TILE + TILE / 2, width: 0, height: 0, point: true, visible: true, rotation: 0 }],
    },
  ],
};

fs.writeFileSync("public/world-assets/map.json", JSON.stringify(map, null, 1));
console.log(`map ${W}x${H}, ${collision.length} collision rects, ${anchors.length} anchors`);
