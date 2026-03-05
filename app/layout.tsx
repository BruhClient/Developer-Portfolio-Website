import type { Metadata } from "next";
import { ABeeZee, Andika, Inter, Jua, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import SocialLinksBar from "@/components/social-links-bar";
import { BackgroundFlyingIcons } from "@/components/flying-icons";
import { Toaster } from "sonner";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400"],
});

const serif = Jua({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Travis Ang",
  description: "Developer Portfolio website of Travis Ang",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👋</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${serif.variable} font-sans antialiased px-5 pt-3 pb-10`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <SocialLinksBar />

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
