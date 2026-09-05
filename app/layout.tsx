import type { Metadata } from "next";
import { Archivo, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import SocialLinksBar from "@/components/social-links-bar";
import { ScrollProgress } from "@/components/scroll-progress";
import { Toaster } from "sonner";

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
  openGraph: {
    title: "Travis Ang · Data Science & AI",
    description:
      "Building agentic AI systems, full-stack products, and data tooling.",
    type: "website",
    locale: "en_SG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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

        <ScrollProgress />
        <Navbar />
        <main id="main">{children}</main>
        <SocialLinksBar />
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
