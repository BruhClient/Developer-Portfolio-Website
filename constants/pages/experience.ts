export interface ExperienceEntry {
  id: string;
  role: string;
  organisation: string;
  /** e.g. "Jan 2023 to Nov 2024" */
  period: string;
  /** e.g. "Part-time", "National Service" */
  type?: string;
  location?: string;
  /** Bullets under the role. The block is skipped when empty. */
  highlights?: string[];
  /** Optional link out, e.g. to work built during the role. */
  link?: { label: string; href: string };
}

export interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  /** e.g. "May 2025" */
  issued: string;
  /** Public verification link, when there is one. */
  credentialUrl?: string;
}

/* Newest first, since the timeline renders in array order. */
export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: "lalagreen",
    role: "AI and Automation Specialist",
    organisation: "LaLaGreen",
    period: "May 2026 to Aug 2026",
    type: "Internship",
    location: "Singapore · Hybrid",
    highlights: [
      "Designed and deployed n8n automation pipelines integrating the Amazon SP-API and Amazon Ads API.",
      "Implemented Hermes, an AI agent that solves real operational problems for the business.",
      "Developed internal tools adopted team-wide to streamline workflows.",
      "Set up and managed a VPS, using Docker to deploy and run services.",
      "Presented ideas to non-technical and non-English-speaking stakeholders to drive widespread adoption.",
      "Gained hands-on knowledge of marketing and business fundamentals, including marketing strategy and what it takes to run a successful e-commerce business.",
    ],
  },
  {
    id: "mindflex-tuition-academy",
    role: "Tuition Teacher",
    organisation: "MindFlex Tuition Academy",
    period: "Jan 2025 to Jul 2025",
    type: "Part-time",
    location: "Singapore",
    highlights: [],
  },
  {
    id: "singapore-armed-forces",
    role: "Platoon Sergeant",
    organisation: "Singapore Armed Forces",
    period: "Jan 2023 to Nov 2024",
    type: "National Service",
    location: "Singapore",
    highlights: [
      "Streamlined inventory tracking for the entire unit by building a Telegram bot that monitored the deployment and functionality of drone and camera equipment.",
      "Automated updates and centralised records with Python and Google Sheets, saving time, reducing errors and improving operational efficiency.",
    ],
    link: {
      label: "Drone & camera inventory bot",
      href: "/projects/millitary-stores-telegram-bot",
    },
  },
];

export const CERTIFICATES: CertificateEntry[] = [
  {
    id: "databricks-ai-bi-data-analyst",
    name: "Databricks AI/BI For Data Analyst",
    issuer: "Databricks",
    issued: "Jan 2026",
  },
  {
    id: "machine-learning-specialization",
    name: "Machine Learning Specialization",
    issuer: "DeepLearning.AI",
    issued: "May 2025",
  },
  {
    id: "python-for-data-science-and-ai",
    name: "Python for Data Science and AI",
    issuer: "IBM",
    issued: "May 2025",
  },
  {
    id: "microsoft-excel-specialization",
    name: "Microsoft Excel Specialization",
    issuer: "Microsoft",
    issued: "May 2025",
  },
];
