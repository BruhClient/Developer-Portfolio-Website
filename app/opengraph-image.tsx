import { ImageResponse } from "next/og";
import { ABOUT } from "@/constants/pages/about";
import { PROFILE } from "@/constants/profile";

/*
  The card a link to this site unfurls into, on LinkedIn, WhatsApp, Slack.

  Rendered at build time rather than drawn by hand, so it says whatever the
  constants say - a changed role cannot leave a stale image behind. The palette
  is the room's: the same near-black ground and warm amber the reader panel
  uses, so the preview and the site look like the same thing.

  No web fonts. Fetching one here would make the build depend on a network call
  to render an image, and the system stack it falls back to is perfectly legible
  at this size.
*/

export const alt = `${PROFILE.name} — ${PROFILE.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d0f18",
          padding: "84px 88px",
        }}
      >
        {/* A warm rule at the top, standing in for the room's lamplight. */}
        <div style={{ display: "flex", width: 140, height: 6, backgroundColor: "#fcd34d" }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 700,
              color: "#fffbeb",
              letterSpacing: "-0.02em",
            }}
          >
            {PROFILE.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 34,
              color: "#fcd34d",
            }}
          >
            {PROFILE.jobTitle}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 27,
              lineHeight: 1.45,
              color: "rgba(255,251,235,0.66)",
              maxWidth: 900,
            }}
          >
            {ABOUT.lead}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,251,235,0.42)",
          }}
        >
          {PROFILE.university}
        </div>
      </div>
    ),
    size,
  );
}
