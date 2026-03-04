export interface PageImage {
  src: string;
  alt: string;
}

export type LinkIcon = "github" | "presentation" | "globe";

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
  date: string;
  collaborators: string[];
  /** Full tech list shown on the detail page header */
  techs: string[];
  /** Subset shown on the home card — defaults to techs if omitted */
  cardTechs?: string[];
  links: PageLink[];
  overview: string;
  images: PageImage[];
  impacts: string[];
  whatIDid: string[];
  reflection: string;
}
