import { CONTACT_CHANNELS } from "@/constants/contact";
import { ABOUT } from "@/constants/pages/about";
import { PROFILE } from "@/constants/profile";
import { RESUME_HREF } from "@/room/data/bindings";
import { ZONES, ZONE_ORDER } from "@/room/data/zones";
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
      {/*
        What anything that does not run JavaScript receives.

        The room draws every word of the site into a canvas, so without this the
        page is literally empty - a crawler fetching `/` got a dark div and one
        sentence. This is not the whole portfolio, which would double the weight
        of a page whose job is to load a 3D scene quickly; it is enough to say
        who this is and where the full text lives, with a real link into each
        section so a crawler has somewhere to follow.

        Built from the same ZONE_ORDER the room and the Tab ring use, so a
        seventh section cannot appear in the room and be missing here.
      */}
      <noscript>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: 24, lineHeight: 1.6 }}>
          <h1>{PROFILE.name}</h1>
          <p>{PROFILE.jobTitle} at {PROFILE.university}.</p>
          <p>{ABOUT.lead}</p>
          <p>
            This page is an interactive 3D room and needs JavaScript and WebGL. The
            complete portfolio is available as plain text at{" "}
            <a href="/text">/text</a>.
          </p>
          <ul>
            {ZONE_ORDER.map((zone) => (
              <li key={zone}>
                <a href={`/text#${zone}`}>{ZONES[zone].label}</a>
              </li>
            ))}
          </ul>
          <p>
            <a href={RESUME_HREF}>Download resume (PDF)</a>
          </p>
          <ul>
            {CONTACT_CHANNELS.map((channel) => (
              <li key={channel.href}>
                <a href={channel.href}>
                  {channel.label}: {channel.value}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
