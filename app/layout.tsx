import type { Metadata } from "next";
import { Archivo, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/site";
import { siteSchema } from "@/lib/structured-data";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Kept only for small metadata labels (dates, counters) — no longer the UI font.
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  /*
    Without this every og:image and canonical is emitted as a relative path,
    which the crawlers that read them cannot resolve. It is the one piece of
    metadata that has to be absolute, so it is the one that has to know the
    deployed host - see lib/site.ts for how that is worked out.
  */
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Travis Ang · Data Science & AI",
    template: "%s · Travis Ang",
  },
  description:
    "Travis Ang is a Data Science and AI undergraduate at Nanyang Technological University, building agentic AI systems, full-stack products, and data tooling.",
  keywords: [
    "Travis Ang",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Portfolio",
    "NTU",
  ],
  authors: [{ name: "Travis Ang" }],
  creator: "Travis Ang",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Travis Ang · Data Science & AI",
    description:
      "Building agentic AI systems, full-stack products, and data tooling.",
    type: "website",
    locale: "en_SG",
    url: "/",
    siteName: "Travis Ang · Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travis Ang · Data Science & AI",
    description:
      "Building agentic AI systems, full-stack products, and data tooling.",
  },
  /*
    Spelled out rather than left to the default. `max-image-preview:large` is
    what lets a result carry the preview image rather than a thumbnail, and
    saying so costs nothing.
  */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          Server-rendered, and deliberately so: the homepage draws itself into a
          canvas, so this is the only thing at `/` that tells a crawler whose
          site this is. See lib/structured-data.ts.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema()) }}
        />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-sans antialiased`}
      >
        {/* Skip link — first tab stop, visible only when focused */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to content
        </a>

        {/*
          No header, no footer, no nav. The room is the navigation, and chrome
          around it would undo the thing the whole design is for.
        */}
        <main id="main">{children}</main>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
