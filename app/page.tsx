import { RoomShell } from "@/room/RoomShell";

/*
  The homepage is the room. There are no other content routes: everything opens
  in a panel beside it, which is the whole point. /text carries the same content
  for anyone who cannot run WebGL.
*/
export default function Home() {
  return (
    <>
      <RoomShell />
      <noscript>
        <div style={{ padding: 24 }}>
          <p>
            This site is an interactive 3D room and needs JavaScript. The full text
            version is at <a href="/text">/text</a>.
          </p>
        </div>
      </noscript>
    </>
  );
}
