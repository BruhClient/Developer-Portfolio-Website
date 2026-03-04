import { PageData } from "./types";

export const HACKATHONS: PageData[] = [
  {
    slug: "nus-maritime-hackathon-2026",
    title: "NUS Maritime Hackathon 2026",
    cardTitle: "NUS Maritime Hackathon 2026",
    date: "7 February 2026",
    collaborators: ["Low Dong Xuan", "Tayzar Toe Wai", "Shadid Z. Rahman"],
    techs: ["SQL", "Databricks", "Python"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/steaksandshrooms/Maritime-Fleet-Optimisation",
        icon: "github",
      },
      {
        label: "Presentation Slides",
        href: "/hackathon/maritime-hackathon/showcase.ppt",
        icon: "presentation",
        download: true,
      },
    ],
    overview:
      "This Hackathon involved creating a comprehensive maritime data visualization dashboard using Databricks. The dashboard provides insights into global shipping patterns, port activities, and maritime trade.",
    images: [
      { src: "/hackathon/maritime-hackathon/map.png", alt: "map" },
      { src: "/hackathon/maritime-hackathon/cost.png", alt: "cost" },
      {
        src: "/hackathon/maritime-hackathon/cost-efficiency.png",
        alt: "cost-efficiency",
      },
      {
        src: "/hackathon/maritime-hackathon/distribution-main-engine.png",
        alt: "main-engine",
      },
      {
        src: "/hackathon/maritime-hackathon/distribution-safety.png",
        alt: "safety",
      },
    ],
    impacts: [
      "Delivered an interactive Databricks dashboard covering DWT distribution, cost efficiency, main engine types, and safety scores.",
      "Provided actionable maritime insights that informed fleet optimisation decisions.",
      "Demonstrated how data visualisation can surface patterns across thousands of vessel records.",
    ],
    whatIDid: [
      "Wrote 200+ lines of SQL to clean, transform, and query maritime datasets.",
      "Applied data quality methodology to ensure accuracy before visualisation.",
      "Built interactive charts and maps to represent complex maritime data.",
      "Leveraged MLIP heuristics to balance competing variables in our analysis.",
      "Collaborated with a team of 4, coordinating task allocation across the hackathon.",
    ],
    reflection:
      "I learned a lot from this hackathon. My SQL could have been written more efficiently, and I could have allocated tasks better. I also realized how important domain knowledge is—it acts as a safety check when SQL goes wrong, helping us know what the expected target values should be before visualizing them.",
  },
];
