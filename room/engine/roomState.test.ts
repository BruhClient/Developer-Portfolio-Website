import { beforeEach, describe, expect, test } from "vitest";
import { back, enterRoom, getRoomState, openItem, resetRoom, setFocused } from "./roomState";

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

describe("stepping back", () => {
  test("closing an item returns to the whole room in one step", () => {
    // It used to land in a "zone" level that nothing could enter or explain,
    // framed tight on one corner - reported as "I cannot zoom out after cancel".
    openItem("hackathon:0");
    back();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().zone).toBeNull();
    expect(getRoomState().item).toBeNull();
  });

  test("back from home stays home, so Escape can never strand a visitor", () => {
    back();
    back();
    expect(getRoomState().level).toBe("home");
  });

  test("closing keeps what has been opened, so markers stay marked", () => {
    openItem("project:git-dummy");
    back();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().opened.has("project:git-dummy")).toBe(true);
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
    back();
    expect(getRoomState().entered).toBe(true);
  });

  test("entering does not open anything", () => {
    enterRoom();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().item).toBeNull();
  });
});
