"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Application, Assets, Container, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { cameraTopLeft } from "../engine/Camera";
import { moveAndCollide, type Rect } from "../engine/Collision";
import { directionVector } from "../engine/Input";
import { stepAccumulator } from "../engine/loop";
import {
  anchorsFrom,
  collisionFrom,
  spawnFrom,
  tileRefFromGid,
  type TiledMap,
} from "../engine/TiledMap";
import { nearestInteractable } from "../engine/Interaction";
import {
  buildInteractables,
  type Interactable,
} from "../content/interactables";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { DialogueBox } from "./DialogueBox";
import { WorldFallback } from "./WorldFallback";
import { ContactModal } from "./ContactModal";
import { resolveSpawn, type Point } from "../content/spawn";
import {
  facingFrom,
  frameAt,
  sliceDirectional,
  type Direction,
} from "../engine/CharacterSprite";

const ZOOM = 2.5;
const FIXED_MS = 16;
const MAX_STEPS = 5;
const SPEED = 1.1;
const RUN_FPS = 10;

// The collision body is a small box at the character's feet. A 16x32 figure
// whose head collided with walls could not stand next to anything.
const FOOT_W = 10;
const FOOT_H = 8;

const DRAWN_LAYERS = ["floor", "walls", "decor"];
const REACH = 24; // 1.5 tiles, so you must actually walk up to a thing
const SAVED_POSITION = "world:position";

/*
  Where the player was standing, so that leaving for a project page and pressing
  back does not respawn them in the lobby. Session storage throws outright in
  some privacy modes, so every access is guarded and simply forgets on failure.
*/
function readSaved(): Point | null {
  try {
    const raw = sessionStorage.getItem(SAVED_POSITION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Point;
    return typeof parsed?.x === "number" && typeof parsed?.y === "number"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function writeSaved(point: Point) {
  try {
    sessionStorage.setItem(SAVED_POSITION, JSON.stringify(point));
  } catch {
    // Nothing to do; the player simply starts from the map's spawn next time.
  }
}

function footBody(x: number, y: number): Rect {
  return { x: x - FOOT_W / 2, y: y - FOOT_H, w: FOOT_W, h: FOOT_H };
}

function frameTexture(sheet: Texture, f: { x: number; y: number; w: number; h: number }) {
  return new Texture({
    source: sheet.source,
    frame: new Rectangle(f.x, f.y, f.w, f.h),
  });
}

export function WorldCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [failed, setFailed] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [prompt, setPrompt] = useState<Interactable | null>(null);
  const [dialogue, setDialogue] = useState<{
    item: Interactable;
    beat: number;
  } | null>(null);

  // The Pixi ticker is created once and closes over its first render. Refs are
  // how the simulation reads state that React owns.
  const contactRef = useRef(contactOpen);
  useEffect(() => {
    contactRef.current = contactOpen;
  }, [contactOpen]);

  const dialogueRef = useRef(dialogue);
  const promptRef = useRef(prompt);
  useEffect(() => {
    dialogueRef.current = dialogue;
  }, [dialogue]);
  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const advance = useCallback(() => {
    setDialogue((current) => {
      if (!current) return null;
      const next = current.beat + 1;
      return next < current.item.beats.length
        ? { ...current, beat: next }
        : current;
    });
  }, []);

  const follow = useCallback(() => {
    const action = dialogueRef.current?.item.action;
    if (!action) return;

    if (action.mode === "modal") {
      setDialogue(null);
      setContactOpen(true);
      return;
    }

    if (!action.href) return;
    if (action.mode === "internal") router.push(action.href);
    else if (action.mode === "external") window.open(action.href, "_blank");
    else window.location.href = action.href;
  }, [router]);

  const advanceRef = useRef(advance);
  const followRef = useRef(follow);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);
  useEffect(() => {
    followRef.current = follow;
  }, [follow]);

  const positionRef = useRef<Point | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let app: Application | null = null;
    const keys = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.add(key);

      if (key === "escape") return setDialogue(null);

      if (key === "e") {
        if (dialogueRef.current) advanceRef.current();
        else if (promptRef.current)
          setDialogue({ item: promptRef.current, beat: 0 });
        return;
      }

      if (key === "r" && dialogueRef.current) followRef.current();
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const onBlur = () => keys.clear();

    void (async () => {
      const response = await fetch("/world-assets/map.json");
      if (!response.ok) throw new Error("world map failed to load");
      const map: TiledMap = await response.json();
      if (disposed) return;

      const created = new Application();
      await created.init({
        resizeTo: host,
        background: "#12100e",
        antialias: false,
        roundPixels: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });
      if (disposed) return created.destroy(true, { children: true });

      // Tiled writes whatever relative path the editor saw; only the file name
      // is meaningful once the sheets are served from /world-assets.
      const sheets = await Promise.all(
        map.tilesets.map((tileset) =>
          Assets.load("/world-assets/" + tileset.image.split(/[\/]/).pop()),
        ),
      );
      const [idleSheet, runSheet] = await Promise.all([
        Assets.load("/world-assets/characters/Adam_idle.png"),
        Assets.load("/world-assets/characters/Adam_run.png"),
      ]);
      if (disposed) return created.destroy(true, { children: true });

      app = created;
      host.appendChild(created.canvas);

      const world = new Container();
      created.stage.addChild(world);

      const cache = new Map<string, Texture>();
      const tileTexture = (sheet: number, c: number, r: number) => {
        const key = sheet + ":" + c + ":" + r;
        const hit = cache.get(key);
        if (hit) return hit;
        const made = frameTexture(sheets[sheet], {
          x: c * map.tilewidth,
          y: r * map.tileheight,
          w: map.tilewidth,
          h: map.tileheight,
        });
        cache.set(key, made);
        return made;
      };

      for (const name of DRAWN_LAYERS) {
        const layer = map.layers.find(
          (candidate) => candidate.name === name && candidate.type === "tilelayer",
        );
        if (!layer?.data) continue;

        const group = new Container();
        layer.data.forEach((gid, index) => {
          const ref = tileRefFromGid(gid, map.tilesets);
          if (!ref) return;
          const sprite = new Sprite(tileTexture(ref.sheet, ref.c, ref.r));
          sprite.position.set(
            (index % map.width) * map.tilewidth,
            Math.floor(index / map.width) * map.tileheight,
          );
          group.addChild(sprite);
        });
        world.addChild(group);
      }

      const idle = sliceDirectional(1);
      const run = sliceDirectional(6);
      const idleTex = {} as Record<Direction, Texture[]>;
      const runTex = {} as Record<Direction, Texture[]>;
      (["right", "up", "left", "down"] as Direction[]).forEach((d) => {
        idleTex[d] = idle[d].map((f) => frameTexture(idleSheet, f));
        runTex[d] = run[d].map((f) => frameTexture(runSheet, f));
      });

      const playerView = new Sprite(idleTex.down[0]);
      playerView.anchor.set(0.5, 1);
      world.addChild(playerView);

      const interactables = buildInteractables(anchorsFrom(map), {
        projects: PROJECTS,
        hackathons: HACKATHONS,
        experience: EXPERIENCE,
        certificates: CERTIFICATES,
      });

      const promptView = new Text({
        text: "E",
        style: {
          fill: "#fbf7f0",
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: "bold",
        },
      });
      promptView.anchor.set(0.5, 1);
      promptView.visible = false;
      world.addChild(promptView);

      const solids = collisionFrom(map);
      // A link says where to go, a remembered position brings you back, and the
      // map's own spawn is the fallback.
      const spawn = resolveSpawn({
        room: new URLSearchParams(window.location.search).get("room"),
        saved: readSaved(),
        anchors: anchorsFrom(map),
        mapSpawn: spawnFrom(map),
      });
      const mapSize = {
        width: map.width * map.tilewidth,
        height: map.height * map.tileheight,
      };

      const player = { x: spawn.x, y: spawn.y };
      positionRef.current = player;
      let facing: Direction = "down";
      let animMs = 0;
      let accumulator = 0;

      created.ticker.add((ticker) => {
        const { steps, remainder } = stepAccumulator(
          accumulator,
          ticker.deltaMS,
          FIXED_MS,
          MAX_STEPS,
        );
        accumulator = remainder;

        // Reading a textbox should not also walk you out of the room.
        const frozen = dialogueRef.current !== null || contactRef.current;
        const direction = frozen ? { x: 0, y: 0 } : directionVector(keys);
        const moving = direction.x !== 0 || direction.y !== 0;
        facing = facingFrom(direction, facing);

        for (let step = 0; step < steps; step += 1) {
          const moved = moveAndCollide(
            footBody(player.x, player.y),
            direction.x * SPEED,
            direction.y * SPEED,
            solids,
          );
          player.x = moved.x + FOOT_W / 2;
          player.y = moved.y + FOOT_H;
        }

        animMs = moving ? animMs + ticker.deltaMS : 0;
        playerView.texture = moving
          ? runTex[facing][frameAt(animMs, runTex[facing].length, RUN_FPS)]
          : idleTex[facing][0];
        playerView.position.set(Math.round(player.x), Math.round(player.y));

        const near = nearestInteractable(player, facing, interactables, REACH);
        if (near?.id !== promptRef.current?.id) setPrompt(near);
        promptView.visible = near !== null && !frozen;
        if (near) promptView.position.set(near.x, near.y - 6);

        const camera = cameraTopLeft(
          player,
          {
            width: created.screen.width / ZOOM,
            height: created.screen.height / ZOOM,
          },
          mapSize,
        );
        world.scale.set(ZOOM);
        world.position.set(
          Math.round(-camera.x * ZOOM),
          Math.round(-camera.y * ZOOM),
        );
      });
    })().catch((error) => {
      // A blocked GPU, a missing tileset, a corrupt map: whatever the cause,
      // the visitor gets the readable version of the site rather than a black
      // rectangle.
      console.error("world failed to start", error);
      if (!disposed) setFailed(true);
    });

    const remember = () => {
      if (positionRef.current) writeSaved(positionRef.current);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", remember);

    return () => {
      disposed = true;
      remember();
      window.removeEventListener("pagehide", remember);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      app?.destroy(true, { children: true });
    };
  }, []);

  return (
    <>
      {!failed ? (
        <div ref={hostRef} className="h-dvh w-full touch-none" />
      ) : null}
      <WorldFallback visible={failed} />
      {contactOpen ? (
        <ContactModal onClose={() => setContactOpen(false)} />
      ) : null}
      {dialogue ? (
        <DialogueBox
          item={dialogue.item}
          beat={dialogue.beat}
          onAdvance={advance}
          onClose={() => setDialogue(null)}
        />
      ) : null}
    </>
  );
}
