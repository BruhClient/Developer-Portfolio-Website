import { PageData } from "./types";

export const PROJECTS: PageData[] = [
  {
    slug: "git-dummy",
    title: "Git Dummy: A Visual Git Client",
    cardTitle: "Git Dummy: Visual Git Client",
    date: "April to July 2026",
    collaborators: [],
    techs: [
      "Python",
      "PyQt5",
      "GitPython",
      "qtawesome",
      "PyInstaller",
      "NSIS",
      "Next.js",
      "Framer Motion",
    ],
    cardTechs: ["Python", "PyQt5", "GitPython"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/BruhClient/Git-Dummy",
        icon: "github",
      },
      {
        label: "Download for Windows",
        href: "https://github.com/BruhClient/Git-Dummy/releases/latest/download/GitDummy-windows.exe",
        icon: "globe",
      },
      {
        label: "Download for macOS",
        href: "https://github.com/BruhClient/Git-Dummy/releases/latest/download/GitDummy-macos.zip",
        icon: "globe",
      },
    ],
    overview:
      "Git Dummy is a desktop Git client that draws your commit history as a graph you can actually read. You can branch, merge, stash, diff and open pull requests without touching the command line. It's a real app rather than a demo: version 1.0.8, with installers for Windows and macOS.",
    images: [
      { src: "/projects/git-dummy/commit-graph.png", alt: "commit-graph" },
      { src: "/projects/git-dummy/diff-viewer.png", alt: "diff-viewer" },
      {
        src: "/projects/git-dummy/branch-management.png",
        alt: "branch-management",
      },
      { src: "/projects/git-dummy/pull-requests.png", alt: "pull-requests" },
    ],
    impacts: [
      "Shipped on two platforms, with a Windows installer and a macOS build on GitHub Releases.",
      "Took the command line out of everyday Git. Branching, merging, stashing, reverting and diffing are all clicks.",
      "Made history readable with a lane-based commit graph, plus a minimap for repos too big to fit on screen.",
      "Stopped the classic beginner mistake of losing work, by auto-stashing changes on checkout.",
      "Gave the app a proper download page instead of a bare repo.",
    ],
    whatIDid: [
      "Built the app in PyQt5 on top of GitPython, keeping every Git operation behind a threaded worker pool so the window never freezes on a slow fetch.",
      "Wrote the commit graph from scratch on a QGraphicsScene, including the lane algorithm that sorts concurrent branches into columns.",
      "Added GitHub OAuth with multi-account support, so several accounts stay connected and switch instantly.",
      "Built the pull request flow: open, review and merge PRs in the app, with conflict detection before the merge.",
      "Packaged and shipped it, with PyInstaller specs for both platforms, an NSIS installer, and a GitHub Actions workflow that publishes the releases.",
      "Built the landing site in Next.js with Framer Motion, including an animated commit graph in the hero.",
    ],
    reflection:
      "Writing a Git GUI made me actually learn Git's object model, because you can't draw a commit graph until you understand what a commit points at. The lane algorithm took a few rewrites before a busy history read cleanly. Packaging was the part I underestimated: getting a Python app to install properly on two operating systems took as long as some of the features.",
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
