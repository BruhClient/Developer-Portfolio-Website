import { beforeEach, describe, expect, test } from "vitest";
import {
  back,
  close,
  enterRoom,
  follow,
  getRoomState,
  openItem,
  resetRoom,
  setFocused,
} from "./roomState";

/*
  The camera model is the part of the spec a visitor feels most directly, and
  the part most likely to break quietly: a close button that leaves the camera
  somewhere the visitor cannot get out of looks like a camera bug, not a state
  bug - which is exactly how the old middle "zone" level was reported, as "I
  cannot zoom out after I cancel". Making the store plain data means these
  transitions can be asserted here rather than clicked through by hand.
*/
beforeEach(resetRoom);

describe("opening things", () => {
  test("opening an item goes to the item level and adopts its zone", () => {
    openItem("project:git-dummy");
    expect(getRoomState().level).toBe("item");
    expect(getRoomState().zone).toBe("projects");
    expect(getRoomState().item).toBe("project:git-dummy");
  });

  test("an unknown binding changes nothing, rather than opening an empty panel", () => {
    openItem("project:does-not-exist");
    expect(getRoomState()).toEqual({
      entered: false,
      level: "home",
      zone: null,
      item: null,
      hovered: null,
      focused: null,
      opened: new Set(),
      trail: [],
    });
  });

  test("remembers what has been opened, so it stops pulsing", () => {
    openItem("project:git-dummy");
    openItem("hackathon:0");
    expect([...getRoomState().opened].sort()).toEqual([
      "hackathon:0",
      "project:git-dummy",
    ]);
  });
});

describe("closing", () => {
  test("closing an item returns to the whole room in one step", () => {
    // It used to land in a "zone" level that nothing could enter or explain,
    // framed tight on one corner - reported as "I cannot zoom out after cancel".
    openItem("hackathon:0");
    close();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().zone).toBeNull();
    expect(getRoomState().item).toBeNull();
  });

  test("closing from home stays home, so Escape can never strand a visitor", () => {
    close();
    close();
    expect(getRoomState().level).toBe("home");
  });

  test("closing keeps what has been opened, so markers stay marked", () => {
    openItem("project:git-dummy");
    close();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().opened.has("project:git-dummy")).toBe(true);
  });

  test("closing from deep in a trail leaves nothing behind to step back into", () => {
    openItem("hackathons");
    follow("hackathon:0");
    close();
    expect(getRoomState().trail).toEqual([]);
  });
});

/*
  Opening Hackathons and picking one out of the list is the one journey with a
  level above it, and it used to be a dead end: Escape threw the section away
  too, and the sibling links move sideways. These pin the way back.
*/
describe("stepping back through the trail", () => {
  test("a link followed inside the reader leaves a way back to where it came from", () => {
    openItem("hackathons");
    follow("hackathon:0");
    expect(getRoomState().trail).toEqual(["hackathons"]);

    back();
    expect(getRoomState().item).toBe("hackathons");
    expect(getRoomState().level).toBe("item");
    expect(getRoomState().trail).toEqual([]);
  });

  test("back unwinds one step at a time, not all of them", () => {
    openItem("hackathons");
    follow("hackathon:0");
    follow("hackathon:1");
    expect(getRoomState().trail).toEqual(["hackathons", "hackathon:0"]);

    back();
    expect(getRoomState().item).toBe("hackathon:0");
    back();
    expect(getRoomState().item).toBe("hackathons");
  });

  test("back with nothing behind it closes, rather than doing nothing at all", () => {
    openItem("hackathons");
    back();
    expect(getRoomState().level).toBe("home");
  });

  test("clicking an object in the room starts fresh - the room is the top level", () => {
    openItem("hackathons");
    follow("hackathon:0");
    openItem("experience");
    expect(getRoomState().trail).toEqual([]);
  });

  test("going back somewhere already on the trail cuts to it instead of deepening", () => {
    // Otherwise bouncing between a list and its entries grows an ever-longer
    // path out of what the visitor experiences as going back and forth.
    openItem("hackathons");
    follow("hackathon:0");
    follow("hackathons");
    expect(getRoomState().item).toBe("hackathons");
    expect(getRoomState().trail).toEqual([]);
  });

  test("following what is already open does not stack it on itself", () => {
    openItem("hackathons");
    follow("hackathons");
    expect(getRoomState().trail).toEqual([]);
  });

  test("following an unknown binding changes nothing", () => {
    openItem("hackathons");
    follow("hackathon:does-not-exist");
    expect(getRoomState().item).toBe("hackathons");
    expect(getRoomState().trail).toEqual([]);
  });

  test("following from home opens without inventing a step back", () => {
    follow("hackathons");
    expect(getRoomState().item).toBe("hackathons");
    expect(getRoomState().trail).toEqual([]);
  });
});

describe("focus", () => {
  test("keyboard focus is independent of what is open", () => {
    setFocused("hackathons:cart-2");
    expect(getRoomState().focused).toBe("hackathons:cart-2");
    expect(getRoomState().level).toBe("home");
  });
});

describe("the welcome screen", () => {
  test("a fresh arrival has not entered, so the welcome shows", () => {
    expect(getRoomState().entered).toBe(false);
  });

  test("entering is one-way within a visit", () => {
    enterRoom();
    expect(getRoomState().entered).toBe(true);
    // Closing a panel must not put the visitor back on the front door.
    openItem("project:git-dummy");
    close();
    expect(getRoomState().entered).toBe(true);
  });

  test("entering does not open anything", () => {
    enterRoom();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().item).toBeNull();
  });
});
