import { describe, expect, test } from "vitest";
import type { PageData } from "@/constants/pages/types";
import type {
  CertificateEntry,
  ExperienceEntry,
} from "@/constants/pages/experience";
import {
  certificateAction,
  certificateBeats,
  experienceAction,
  experienceBeats,
  projectAction,
  projectBeats,
} from "./dialogue";

const project = {
  slug: "git-dummy",
  title: "Git Dummy",
  cardTitle: "Git Dummy",
  date: "2026",
  collaborators: [],
  techs: ["Python", "PyQt5", "GitPython", "NSIS"],
  cardTechs: ["Python", "PyQt5"],
  links: [],
  overview: "A desktop git client for people who don't know git.",
  images: [],
  impacts: [],
  whatIDid: [],
  reflection: "",
} as PageData;

describe("projectBeats", () => {
  test("leads with the overview", () => {
    expect(projectBeats(project)[0]).toBe(project.overview);
  });

  test("shows the short tech list rather than the full one", () => {
    // The dialogue box is small; cardTechs exists precisely because the full
    // list does not fit somewhere this size.
    expect(projectBeats(project)[1]).toBe("Python · PyQt5");
  });

  test("mentions an award only when there is one", () => {
    expect(projectBeats(project)).toHaveLength(2);
    expect(projectBeats({ ...project, award: "Finalist" })).toHaveLength(3);
    expect(projectBeats({ ...project, award: "Finalist" })[2]).toContain(
      "Finalist",
    );
  });
});

const experience: ExperienceEntry = {
  id: "lalagreen",
  role: "AI and Automation Specialist",
  organisation: "LaLaGreen",
  period: "May 2026 to Aug 2026",
  highlights: ["Built n8n pipelines.", "Shipped Hermes."],
};

describe("experienceBeats", () => {
  test("opens with the role and the organisation", () => {
    expect(experienceBeats(experience)[0]).toBe(
      "AI and Automation Specialist at LaLaGreen",
    );
  });

  test("carries every highlight, because there is no page to read on to", () => {
    expect(experienceBeats(experience)).toEqual([
      "AI and Automation Specialist at LaLaGreen",
      "May 2026 to Aug 2026",
      "Built n8n pipelines.",
      "Shipped Hermes.",
    ]);
  });
});

const certificate: CertificateEntry = {
  id: "databricks",
  name: "Databricks AI/BI For Data Analyst",
  issuer: "Databricks",
  issued: "May 2025",
};

describe("certificateBeats", () => {
  test("names the certificate and who issued it when", () => {
    expect(certificateBeats(certificate)).toEqual([
      "Databricks AI/BI For Data Analyst",
      "Databricks, May 2025",
    ]);
  });
});

describe("read more actions", () => {
  test("sends projects and hackathons to their own pages", () => {
    expect(projectAction(project, "projects")).toEqual({
      label: "Read more",
      href: "/projects/git-dummy",
      mode: "internal",
    });
    expect(projectAction(project, "hackathons").href).toBe(
      "/hackathons/git-dummy",
    );
  });

  test("offers a certificate's credential when it has one", () => {
    expect(
      certificateAction({ ...certificate, credentialUrl: "https://x.test/c" }),
    ).toEqual({
      label: "View credential",
      href: "https://x.test/c",
      mode: "external",
    });
  });

  test("offers nothing when there is nowhere to go", () => {
    // Experience and certificates have no detail route. Advertising a prompt
    // that does nothing is worse than showing no prompt.
    expect(certificateAction(certificate)).toBeNull();
    expect(experienceAction(experience)).toBeNull();
  });

  test("uses an experience's own link when it has one", () => {
    expect(
      experienceAction({
        ...experience,
        link: { label: "See the work", href: "https://y.test" },
      }),
    ).toEqual({
      label: "See the work",
      href: "https://y.test",
      mode: "external",
    });
  });
});
