import { describe, expect, test } from "vitest";
import { resolveSiteUrl } from "./site";

/*
  A wrong absolute URL is the one failure mode that matters here: robots.txt
  would advertise a sitemap nobody serves and every canonical tag would point
  at the wrong host, which is worse for findability than having neither. These
  pin the precedence and the shapes a host can arrive in.
*/
describe("resolving the site URL", () => {
  test("an explicit domain wins over anything Vercel says", () => {
    expect(
      resolveSiteUrl({
        siteUrl: "https://travisang.com",
        vercelEnv: "production",
        productionUrl: "portfolio.vercel.app",
        deploymentUrl: "portfolio-a1b2c3.vercel.app",
      }),
    ).toBe("https://travisang.com");
  });

  test("Vercel's bare host is given the scheme it omits", () => {
    // VERCEL_URL is "my-site.vercel.app", never "https://my-site.vercel.app".
    expect(resolveSiteUrl({ deploymentUrl: "my-site.vercel.app" })).toBe(
      "https://my-site.vercel.app",
    );
  });

  test("production uses the stable domain, not the per-deployment one", () => {
    /*
      The regression this exists for: VERCEL_URL is minted fresh for every
      deployment, so canonical tags and sitemap entries built from it would
      point at a host that is superseded by the next push.
    */
    expect(
      resolveSiteUrl({
        vercelEnv: "production",
        productionUrl: "portfolio.vercel.app",
        deploymentUrl: "portfolio-a1b2c3.vercel.app",
      }),
    ).toBe("https://portfolio.vercel.app");
  });

  test("a preview calls itself by its own deployment URL", () => {
    // A preview really is only reachable there, and should not claim to be
    // production - that is how a preview ends up indexed in production's place.
    expect(
      resolveSiteUrl({
        vercelEnv: "preview",
        productionUrl: "portfolio.vercel.app",
        deploymentUrl: "portfolio-a1b2c3.vercel.app",
      }),
    ).toBe("https://portfolio-a1b2c3.vercel.app");
  });

  test("a trailing slash is dropped, so appending a path cannot double it", () => {
    expect(resolveSiteUrl({ siteUrl: "https://travisang.com/" })).toBe("https://travisang.com");
    expect(resolveSiteUrl({ siteUrl: "https://travisang.com///" })).toBe("https://travisang.com");
  });

  test("a domain typed without a scheme is assumed to be https", () => {
    expect(resolveSiteUrl({ siteUrl: "travisang.com" })).toBe("https://travisang.com");
  });

  test("an http:// domain is left alone, so a local tunnel still works", () => {
    expect(resolveSiteUrl({ siteUrl: "http://192.168.1.10:3000" })).toBe(
      "http://192.168.1.10:3000",
    );
  });

  test("blank and whitespace-only values count as unset, not as a host", () => {
    // An env var declared but left empty is the easiest way to get "https://".
    expect(resolveSiteUrl({ siteUrl: "", deploymentUrl: "my-site.vercel.app" })).toBe(
      "https://my-site.vercel.app",
    );
    expect(resolveSiteUrl({ siteUrl: "   ", deploymentUrl: "  " })).toBe("http://localhost:3000");
  });

  test("nothing set at all falls back to localhost rather than to a guess", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });
});
