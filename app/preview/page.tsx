"use client";

import dynamic from "next/dynamic";

/*
  Temporary while the room is built alongside the old world. Task 17 deletes
  this and moves the room onto `/`.

  This page is a Client Component because Next 16 rejects `ssr: false` on
  `next/dynamic` inside a Server Component. The real entry point in Task 17
  (`room/RoomShell.tsx`) is a client component for the same reason.
*/
const Room = dynamic(() => import("@/room/engine/Room").then((m) => m.Room), {
  ssr: false,
});

export default function Preview() {
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <Room />
    </main>
  );
}
