import { PageData } from "./types";

export const HACKATHONS: PageData[] = [
  {
    slug: "naisc-2026-singtel-churn",
    title: "NAISC 2026 — Singtel Customer Churn Prediction",
    cardTitle: "NAISC 2026 — Singtel Churn Prediction",
    date: "2026",
    collaborators: [
      "Shaun Pan",
      "Iizen Sng",
      "Brennen Goy",
      "Joe Ong Teng Kiat",
    ],
    techs: [
      "Python",
      "LightGBM",
      "Scikit-learn",
      "SciPy",
      "Pandas",
      "NumPy",
      "Streamlit",
      "Plotly",
    ],
    cardTechs: ["Python", "LightGBM", "Streamlit"],
    links: [
      {
        label: "Report",
        href: "/hackathon/naisc-singtel/NAISC Singtel Hackathon 2026 Report.pdf",
        icon: "presentation",
        download: true,
      },
    ],
    overview:
      "For the NAISC 2026 Singtel hackathon, our team built a production-grade, drift-aware ML pipeline that predicts customer churn while actively detecting and correcting for distribution shift between training and deployment data — a problem standard models silently fail at.",
    images: [
      {
        src: "/hackathon/naisc-singtel/drift-detection-summary.png",
        alt: "drift-detection-summary",
      },
      {
        src: "/hackathon/naisc-singtel/psi-per-feature.png",
        alt: "psi-per-feature",
      },
      {
        src: "/hackathon/naisc-singtel/psi-severity-table.png",
        alt: "psi-severity-table",
      },
      {
        src: "/hackathon/naisc-singtel/psi-by-drift-type.png",
        alt: "psi-by-drift-type",
      },
      {
        src: "/hackathon/naisc-singtel/feature-importance-cbdt.png",
        alt: "feature-importance-cbdt",
      },
      {
        src: "/hackathon/naisc-singtel/model-performance-metrics.png",
        alt: "model-performance-metrics",
      },
    ],
    impacts: [
      "Built a two-axis drift detection system testing every feature with KS, PSI, Wasserstein, Chi-square, CBDT, MMD, and Fisher z-tests, with Benjamini-Hochberg correction applied across hundreds of simultaneous tests.",
      "Designed a seven-strategy composite sample reweighting pipeline that corrects for covariate and concept drift before any model training begins.",
      "Ran iterative pseudo-labeling over up to 20 rounds, progressively adapting the LightGBM model to the test distribution's own signal.",
      "Delivered a full interactive Streamlit dashboard visualising PSI breakdowns, CBDT AUROC scores, monthly concept drift timelines, and feature importance heatmaps.",
    ],
    whatIDid: [
      "Engineered features including revenue-per-tenure ratios, refund rates, CLV relatives, charge deviations, service counts, and sine/cosine month encodings for seasonality.",
      "Implemented univariate and multivariate drift detection from scratch using KS, PSI, Wasserstein, Chi-square, MMD, CBDT, and pairwise correlation Fisher z-tests.",
      "Built a composite sample reweighting system combining seven drift-correction strategies — proximity, frequency, temporal similarity, CBDT density-ratio, concept drift penalty, null-rate flags, and drift-robust features — log-compressed and normalized to mean 1.0.",
      "Trained a LightGBM binary classifier optimised for AU-PRC with drift-corrected sample weights and iterative pseudo-labeling with confidence thresholds.",
      "Built an interactive Streamlit/Plotly dashboard covering every stage of the drift detection and mitigation pipeline.",
    ],
    reflection:
      "This was the most technically demanding project I've worked on. The key insight — that a model's silent degradation between training and deployment can be systematically diagnosed and corrected — reshaped how I think about production ML. Building the drift detection layer from scratch across seven statistical tests was genuinely difficult, and watching AU-PRC improve round by round during pseudo-labeling made it all feel worthwhile.",
  },
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
