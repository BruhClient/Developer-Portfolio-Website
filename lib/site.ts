/*
  Where the site lives.

  Sitemaps, canonical tags and the robots.txt Sitemap line all need absolute
  URLs, and a wrong one is worse than none: it points crawlers at a host that
  does not serve the page. So nothing is hardcoded and nothing is guessed.

  NEXT_PUBLIC_SITE_URL wins when set, which is how a custom domain is declared.
  Vercel sets VERCEL_URL itself on every deploy, production and preview alike,
  so the common case needs no configuration and a preview deploy never claims
  to be production. Development falls back to localhost.
*/

const DEV_FALLBACK = "http://localhost:3000";

/**
 * Normalises whatever a host was written as into an absolute origin with no
 * trailing slash, so callers can append paths without doubling the separator.
 *
 * `VERCEL_URL` arrives as a bare host - "my-site.vercel.app", no scheme - and a
 * custom domain gets typed by hand, which means it may arrive either way and
 * with a trailing slash. Both are the same site.
 */
function normalise(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export interface SiteUrlEnv {
  /** An explicit custom domain, if there is one. NEXT_PUBLIC_SITE_URL. */
  siteUrl?: string;
  /** VERCEL_ENV: "production", "preview" or "development". */
  vercelEnv?: string;
  /** VERCEL_PROJECT_PRODUCTION_URL - the project's stable production domain. */
  productionUrl?: string;
  /** VERCEL_URL - unique to one deployment, so it changes on every push. */
  deploymentUrl?: string;
}

/**
 * The origin this build should call itself, in order of how much it can be
 * trusted to still be right tomorrow.
 *
 * The distinction between the two Vercel variables is the important part.
 * VERCEL_URL is minted per deployment - `portfolio-a1b2c3.vercel.app` - so
 * using it in production would hand crawlers a canonical URL that changes on
 * every push and a sitemap that ages out with the deploy behind it. The stable
 * production domain is what belongs in production; VERCEL_URL is exactly right
 * for a preview, which genuinely is only reachable at that address.
 */
export function resolveSiteUrl(env: SiteUrlEnv): string {
  const explicit = normalise(env.siteUrl ?? "");
  if (explicit) return explicit;

  const production = normalise(env.productionUrl ?? "");
  if (env.vercelEnv === "production" && production) return production;

  return normalise(env.deploymentUrl ?? "") || production || DEV_FALLBACK;
}

/*
  Read straight off `process.env` rather than through a helper, because Next
  inlines `NEXT_PUBLIC_*` by matching that exact expression in the source. Read
  it any other way and the value is simply absent from the build.
*/
export const SITE_URL = resolveSiteUrl({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  vercelEnv: process.env.VERCEL_ENV,
  productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  deploymentUrl: process.env.VERCEL_URL,
});

/** An absolute URL for a path, for metadata that cannot take a relative one. */
export function absolute(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
