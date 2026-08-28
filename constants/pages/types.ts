export interface PageImage {
  src: string;
  alt: string;
}

export type LinkIcon = "github" | "presentation" | "globe" | "download";

export interface PageLink {
  label: string;
  href: string;
  icon: LinkIcon;
  download?: boolean;
}

export interface PageData {
  slug: string;
  /** Full title shown on the detail page header */
  title: string;
  /** Shorter title shown on the home section card */
  cardTitle: string;
  /**
   * Small line above the card title, for context the title shouldn't carry.
   * Hackathons put the competition here so the card leads with what was built.
   */
  cardKicker?: string;
  /** Result worth badging on the card, e.g. "Finalist". Shown with a crown. */
  award?: string;
  date: string;
  collaborators: string[];
  /** Full tech list shown on the detail page header */
  techs: string[];
  /** Subset shown on the home card — defaults to techs if omitted */
  cardTechs?: string[];
  links: PageLink[];
  overview: string;
  images: PageImage[];
  /**
   * Cover shot for the home card and the 3D device screen. Defaults to the
   * last image, which is usually the most finished one. Set this to any `src`
   * to override, including a shot that is not in `images` at all.
   */
  cardImage?: string;
  impacts: string[];
  whatIDid: string[];
  reflection: string;
}

/**
 * The one place that decides which image fronts an entry. Both card grids and
 * the device screen read through this, so the panel on the tablet can never
 * show a different cover than the card it depicts.
 */
export function cardImageOf(data: PageData): string | undefined {
  return data.cardImage ?? data.images[data.images.length - 1]?.src;
}
