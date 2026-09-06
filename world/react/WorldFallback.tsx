import Link from "next/link";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { ABOUT } from "@/constants/pages/about";
import { CONTACT_CHANNELS } from "@/constants/contact";

/*
  Everything in the world, as an ordinary document.

  This is one mechanism doing three jobs. It is always in the DOM, so search
  engines and screen readers get a complete, navigable site without running a
  frame of WebGL. And when the canvas cannot start, it is unhidden and becomes
  the site: a visitor with a blocked GPU or a failed asset load reads this
  instead of staring at a black rectangle.

  It is built from the content arrays rather than from the map, so it renders
  fully on the server whether or not map.json ever arrives.
*/
export function WorldFallback({ visible }: { visible: boolean }) {
  return (
    <div
      className={
        visible
          ? "mx-auto w-full max-w-3xl px-5 py-16 sm:px-8"
          : "sr-only"
      }
    >
      {visible ? (
        <p className="mb-10 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          The walkable version of this site could not start, so here is
          everything in it as a plain page.
        </p>
      ) : null}

      <h1 className="text-2xl font-medium tracking-tight">Travis Ang</h1>
      <p className="mt-2 text-muted-foreground">{ABOUT.lead}</p>

      <h2 className="mt-10 text-lg font-medium">Projects</h2>
      <ul className="mt-3 space-y-2">
        {PROJECTS.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="underline underline-offset-4"
            >
              {project.cardTitle}
            </Link>
            <span className="text-muted-foreground"> — {project.overview}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-medium">Hackathons</h2>
      <ul className="mt-3 space-y-2">
        {HACKATHONS.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/hackathons/${entry.slug}`}
              className="underline underline-offset-4"
            >
              {entry.cardTitle}
            </Link>
            {entry.award ? <span> — {entry.award}</span> : null}
            <span className="text-muted-foreground"> — {entry.overview}</span>
          </li>
        ))}
      </ul>

      {/* Experience and certificates have no detail pages, so their content is
          written out here in full rather than linked to. */}
      <h2 className="mt-10 text-lg font-medium">Experience</h2>
      <ul className="mt-3 space-y-4">
        {EXPERIENCE.map((role) => (
          <li key={role.id}>
            <p className="font-medium">
              {role.role} at {role.organisation}
            </p>
            <p className="text-sm text-muted-foreground">{role.period}</p>
            {role.highlights?.length ? (
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}
            {role.link ? (
              <a
                href={role.link.href}
                className="text-sm underline underline-offset-4"
              >
                {role.link.label}
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-medium">Certificates</h2>
      <ul className="mt-3 space-y-1">
        {CERTIFICATES.map((certificate) => (
          <li key={certificate.id} className="text-muted-foreground">
            {certificate.credentialUrl ? (
              <a
                href={certificate.credentialUrl}
                className="underline underline-offset-4"
              >
                {certificate.name}
              </a>
            ) : (
              certificate.name
            )}
            {` — ${certificate.issuer}, ${certificate.issued}`}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-medium">More</h2>
      <ul className="mt-3 space-y-1">
        <li>
          <Link href="/about" className="underline underline-offset-4">
            About me
          </Link>
        </li>
        <li>
          <a href="/files/resume.pdf" className="underline underline-offset-4">
            Resume (PDF)
          </a>
        </li>
        {CONTACT_CHANNELS.map((channel) => (
          <li key={channel.label}>
            <a href={channel.href} className="underline underline-offset-4">
              {channel.label}
            </a>
            <span className="text-muted-foreground"> — {channel.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
