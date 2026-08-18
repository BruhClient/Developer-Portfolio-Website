import { PageData } from "./types";

export const PROJECTS: PageData[] = [
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
