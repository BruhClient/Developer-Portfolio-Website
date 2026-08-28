import { PageData } from "./types";

export const PROJECTS: PageData[] = [
  {
    slug: "git-dummy",
    title: "Git Dummy",
    cardTitle: "Git Dummy",
    date: "2026",
    collaborators: [],
    techs: [
      "Python",
      "PyQt5",
      "GitPython",
      "GitHub REST API",
      "PyInstaller",
      "NSIS",
      "pytest",
      "GitHub Actions",
    ],
    cardTechs: ["Python", "PyQt5", "GitPython"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/BruhClient/Git-Dummy",
        icon: "github",
      },
      {
        label: "Website",
        href: "https://git-dummy-website.vercel.app/",
        icon: "globe",
      },
      {
        label: "Download",
        href: "https://github.com/BruhClient/Git-Dummy/releases/latest",
        icon: "download",
      },
    ],
    overview:
      "A desktop git client for people who don't know git. It draws the repo as a map instead of a log: every commit is a node, every branch is a lane, and the commands you'd have to memorise are buttons in plain English.",
    images: [
      { src: "/projects/git-dummy/commit-graph.png", alt: "commit-graph" },
      { src: "/projects/git-dummy/track-a-project.png", alt: "track-a-project" },
      { src: "/projects/git-dummy/sign-in.png", alt: "sign-in" },
    ],
    // The app mark fronts the card, so it isn't repeated in the gallery below.
    // Card covers are cropped to 16:10 and `logo.png` is square, which shaved
    // the head and the base, so `logo-card.png` is that mark padded to 16:10.
    // Transparent on purpose, so it picks up the card surface in either theme.
    cardImage: "/projects/git-dummy/logo-card.png",
    impacts: [
      "Shipped twelve releases as a Windows installer, with in-app updates checked against the release checksums.",
      "Guards every destructive action. Reverting, force pushing and dropping uncommitted work all say what they'd destroy first.",
      "Tested against real throwaway repos instead of mocks, which caught line ending, push rejection and ref resolution bugs.",
    ],
    whatIDid: [
      "Wrote the lane algorithm that lays out the commit graph, diverged local and remote branches included.",
      "Built the PyQt5 UI: pannable canvas with a minimap, diff viewer, and a pull request inbox you can review and merge from.",
      "Wrote a guided tour that runs on a sandbox repo, so first timers can practise without touching their own files.",
      "Put conflict resolution in the app, keep mine or keep theirs per hunk, so nobody hand edits conflict markers.",
      "Kept all git work off the GUI thread, with a test that asserts zero main thread subprocess calls.",
      "Set up the release pipeline with PyInstaller, NSIS and GitHub Actions.",
    ],
    reflection:
      "The hard part wasn't the interface, it was making the app admit what a button is about to destroy. I also stopped trusting my own mocks. I'd written both the fake GitHub responses and the assertions about them, so they stayed green while being wrong together. Real repos and real payloads found bugs the same afternoon.",
  },
  {
    slug: "millitary-stores-telegram-bot",
    title: "Military Stores Telegram Bot",
    cardTitle: "Military Stores Telegram Bot",
    date: "June 2024",
    collaborators: ["Justin Ang"],
    techs: ["Python", "Google Sheets API", "Telegram Bot API", "Digital Ocean"],
    cardTechs: ["Python", "Google Sheets API"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/BruhClient/ISR-Stores-Bot",
        icon: "github",
      },
    ],
    overview:
      "A Telegram bot for tracking military stores inventory, backed by Google Sheets. Instead of logging equipment on paper, the unit checked items in and out through a chat, and the sheet stayed current on its own.",
    images: [
      {
        src: "/projects/millitary-stores-telegram-bot/overview.png",
        alt: "overview",
      },
      { src: "/projects/millitary-stores-telegram-bot/bot.png", alt: "bot" },
      {
        src: "/projects/millitary-stores-telegram-bot/reporting.png",
        alt: "reporting",
      },
    ],
    // The two chat screenshots are phone-sized, so the wide sheet view covers.
    cardImage: "/projects/millitary-stores-telegram-bot/overview.png",
    impacts: [
      "Adopted by the unit and used for about six months to track stores.",
      "Still the reference codebase for new bots being built in the unit.",
      "Gave the higher-ups a live view of equipment straight from Google Sheets.",
    ],
    whatIDid: [
      "Built the bot in Python with the python-telegram-bot library.",
      "Wired it to the Google Sheets API so inventory reads and writes went straight to the sheet.",
      "Added role-based access so only authorised personnel could reach the sensitive commands.",
      "Deployed it on Digital Ocean to keep it running around the clock.",
    ],
    reflection:
      "The bot ran for about six months and the code outlived it. New bots in the unit still get started from it. That taught me something small and boring beats something clever if people actually use it.",
  },
];
