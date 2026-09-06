/*
  The tech shown on the toolkit shelf in the world and on /about. Two rows
  because the marquee this came from counter-scrolled them against each other;
  the grouping is still a useful split between what I build with and what I
  build on.
*/
export const TOOLKIT_ROWS: string[][] = [
  ["Python", "TypeScript", "PyTorch", "Pandas", "SQL", "Supabase", "Databricks"],
  ["Claude Code", "OpenClaw", "MCP", "Hermes", "n8n", "Docker", "Google Cloud"],
];

export const TOOLKIT_FLAT = TOOLKIT_ROWS.flat();
