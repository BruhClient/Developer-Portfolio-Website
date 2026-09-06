import { beforeEach, describe, expect, test } from "vitest";
import {
  back,
  getRoomState,
  goHome,
  openItem,
  openZone,
  resetRoom,
  setFocused,
} from "./roomState";

/*
  The three-level camera model is the part of the spec a visitor feels most
  directly, and the part most likely to break quietly: an Escape that steps back
  two levels looks like a camera bug, not a state bug. Making the store plain
  data means these transitions can be asserted here rather than clicked through
  by hand every time something near them changes.
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
      level: "home",
      zone: null,
      item: null,
      hovered: null,
      focused: null,
      opened: new Set(),
    });
  });

  test("opening a zone clears any open item", () => {
    openItem("project:git-dummy");
    openZone("hackathons");
    expect(getRoomState().level).toBe("zone");
    expect(getRoomState().zone).toBe("hackathons");
    expect(getRoomState().item).toBeNull();
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
  test("item steps back to its own zone, not all the way home", () => {
    openItem("hackathon:0");
    back();
    expect(getRoomState().level).toBe("zone");
    expect(getRoomState().zone).toBe("hackathons");
    expect(getRoomState().item).toBeNull();
  });

  test("zone steps back home", () => {
    openZone("about");
    back();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().zone).toBeNull();
  });

  test("back from home stays home, so Escape can never strand a visitor", () => {
    back();
    back();
    expect(getRoomState().level).toBe("home");
  });

  test("two backs from an open item reach home exactly, never overshooting", () => {
    openItem("certificate:0");
    back();
    back();
    expect(getRoomState().level).toBe("home");
    expect(getRoomState().zone).toBeNull();
    expect(getRoomState().item).toBeNull();
  });

  test("goHome clears the camera but keeps what has been opened", () => {
    openItem("project:git-dummy");
    goHome();
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
