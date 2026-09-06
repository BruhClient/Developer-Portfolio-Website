import Link from "next/link";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { ABOUT } from "@/constants/pages/about";
import { TOOLKIT_ROWS } from "@/constants/toolkit";
import { CONTACT_CHANNELS } from "@/constants/contact";
import type { PageData } from "@/constants/pages/types";

/*
  Every word of the portfolio as plain server-rendered HTML.

  It imports the same constants the room does, so the two cannot drift: adding a
  project makes it appear here and fail the room's coverage test in the same
  commit. This is what crawlers, link previews, screen readers and anyone
  without WebGL actually receive.
*/
export function TextSite() {
  return (
    <main className="mx-auto max-w-2xl space-y-16 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Travis Ang</h1>
        <p className="text-neutral-600 dark:text-neutral-300">{ABOUT.lead}</p>
        <p className="text-sm text-neutral-500">
          This is the text version. The full site is an interactive 3D room at{" "}
          <Link href="/" className="underline underline-offset-4">
            the home page
          </Link>
          .
        </p>
      </header>

      <section id="experience" className="space-y-6">
        <h2 className="text-xl font-semibold">Experience</h2>
        {EXPERIENCE.map((entry) => (
          <article key={entry.id} id={`experience-${entry.id}`} className="space-y-1.5">
            <h3 className="font-medium">
              {entry.role} · {entry.organisation}
            </h3>
            <p className="text-sm text-neutral-500">
              {entry.period}
              {entry.location ? ` · ${entry.location}` : ""}
            </p>
            {entry.highlights && (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {entry.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
        <p>
          <a href="/files/resume.pdf" download className="underline underline-offset-4">
            Download resume
          </a>
        </p>
      </section>

      <TextProjects id="projects" title="Projects" items={PROJECTS} />
      <TextProjects id="hackathons" title="Hackathons" items={HACKATHONS} />

      <section id="certifications" className="space-y-4">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <ul className="space-y-2">
          {CERTIFICATES.map((cert) => (
            <li key={cert.id} id={`certifications-${cert.id}`} className="text-sm">
              <strong className="font-medium">{cert.name}</strong> · {cert.issuer} ·{" "}
              {cert.issued}
              {cert.credentialUrl && (
                <>
                  {" "}
                  <a href={cert.credentialUrl} className="underline underline-offset-4">
                    Verify
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="space-y-4">
        <h2 className="text-xl font-semibold">About Me</h2>
        {ABOUT.sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <h3 className="font-medium">{section.label}</h3>
            {section.paragraphs.map((p) => (
              <p key={p} className="text-sm leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        ))}
        <h3 className="font-medium">Toolkit</h3>
        <p className="text-sm">{TOOLKIT_ROWS.flat().join(" · ")}</p>
      </section>

      <section id="contact" className="space-y-3">
        <h2 className="text-xl font-semibold">Contact Me</h2>
        <ul className="space-y-1 text-sm">
          {CONTACT_CHANNELS.map((channel) => (
            <li key={channel.label}>
              {channel.label}:{" "}
              <a href={channel.href} className="underline underline-offset-4">
                {channel.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function TextProjects({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: PageData[];
}) {
  return (
    <section id={id} className="space-y-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {items.map((item) => (
        // Anchor matches the room's URL convention: #<zone>-<item>.
        <article key={item.slug} id={`${id}-${item.slug}`} className="space-y-2">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-neutral-500">
            {item.date}
            {item.award ? ` · ${item.award}` : ""} · {item.techs.join(", ")}
          </p>
          <p className="text-sm leading-relaxed">{item.overview}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {item.impacts.map((impact) => (
              <li key={impact}>{impact}</li>
            ))}
          </ul>
          {item.links.length > 0 && (
            <p className="text-sm">
              {item.links.map((link) => (
                <a key={link.href} href={link.href} className="mr-3 underline underline-offset-4">
                  {link.label}
                </a>
              ))}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
