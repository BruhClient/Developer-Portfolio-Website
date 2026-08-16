import type { PageImage } from "./pages/types";

/** Solid tile shown while a photo streams in. */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTgxODFCIi8+PC9zdmc+";

/** Deeper tile for lightbox images, which sit against a darker scrim. */
export const LIGHTBOX_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMEQxMTE3Ii8+PC9zdmc+";

/**
 * Every standalone photo on the site — swap one by editing its line here.
 * Project and hackathon imagery is not listed: it belongs to its own entry in
 * constants/pages/. `portrait` feeds both the About section and the hero's 3D
 * screen, so the two can never drift apart.
 */
export const SITE_IMAGES = {
  portrait: {
    src: "/about/portrait.jpg",
    alt: "Travis Ang posing in front of a white wall",
  },
  maritime: {
    src: "/about/presentation.jpg",
    alt: "Travis presenting at the Maritime Youth Forum ",
  },
} satisfies Record<string, PageImage>;
