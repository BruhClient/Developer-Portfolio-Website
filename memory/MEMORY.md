# Portfolio Dev Memory

## Project Overview
Next.js 16 App Router portfolio site with Tailwind CSS 4, ShadCN UI, TypeScript.

## Architecture: Page Generation System (refactored)
- Data lives in `constants/pages/projects.ts` and `constants/pages/hackathons.ts`
- Shared types in `constants/pages/types.ts` (`PageData`, `PageLink`, `PageImage`, `LinkIcon`)
- Single dynamic template per category: `app/projects/[slug]/page.tsx`, `app/hackathons/[slug]/page.tsx`
- Both templates use `generateStaticParams()` + `export const revalidate = 3600` (ISR)
- Home section components (`components/projects.tsx`, `components/hackathons.tsx`) iterate over the data arrays

## Adding New Content
To add a new project: append an entry to `PROJECTS` array in `constants/pages/projects.ts`
To add a new hackathon: append an entry to `HACKATHONS` array in `constants/pages/hackathons.ts`
No new files needed — the dynamic template handles rendering automatically.

## Key Shared Components
- `ProjectHeader` — name, collaborators, techs + back button (client component)
- `ProjectCard` — home section card (client component)
- `Masonry` — responsive image grid
- `CheckText` — green checkmark bullet
- `Techs`, `Collaborators` — tag displays
- `SectionTitle` — `<SectionName />` styled heading

## Tech Stack
- Next.js 16 App Router, React 19, TypeScript 5
- Tailwind CSS 4, ShadCN UI, Radix UI
- EmailJS (contact form), Zod (validation), Next Themes (dark mode)
- Lucide React icons
