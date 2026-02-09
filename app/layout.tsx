import type { Metadata } from "next";
import {
  Crimson_Text,
  Geist,
  Geist_Mono,
  Inter,
  Jua,
  Lora,
  Open_Sans,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import SocialLinksBar from "@/components/social-links-bar";
import { BackgroundFlyingIcons } from "@/components/flying-icons";
import { Toaster } from "sonner";

const sans = Jua({
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
          <BackgroundFlyingIcons />
          <SocialLinksBar />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
