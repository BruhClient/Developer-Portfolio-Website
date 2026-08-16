import { PageData } from "./types";

export const PROJECTS: PageData[] = [
  {
    slug: "iris-ai-assistant",
    title: "IRIS — Intelligent Responsive Intelligence System",
    cardTitle: "IRIS — AI Voice Personal Assistant",
    date: "March 2026",
    collaborators: [],
    techs: [
      "Python",
      "LiveKit Agents",
      "LangGraph",
      "LangChain",
      "OpenAI GPT-4o",
      "ChromaDB",
      "Spotify API",
    ],
    cardTechs: ["Python", "LangGraph", "LiveKit", "GPT-4o"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/BruhClient/Voice-Activated-Personal-AI-Assistant",
        icon: "github",
      },
    ],
    overview:
      "IRIS is a voice-activated personal AI assistant built as a modern take on JARVIS. It runs as a persistent background agent, listening for spoken commands and responding in natural speech with a calm, composed personality. Rather than a simple chatbot, IRIS is a fully agentic system — it reasons about what tools to call, executes them, and synthesizes the results into a single clean spoken response.",
    images: [
      { src: "/projects/iris-ai-assistant/livekit-console.jpg", alt: "livekit-console" },
      {
        src: "/projects/iris-ai-assistant/agent-audio-waveform.png",
        alt: "agent-audio-waveform",
      },
    ],
    impacts: [
      "Delivered a fully hands-free AI assistant with natural voice interaction and a calm, composed personality.",
      "Enabled multi-step reasoning through a LangGraph planner/responder architecture — IRIS can recall a preference, act on it, and confirm the result in one fluid turn.",
      "Enabled persistent personalisation through long-term memory via ChromaDB, including a personalised greeting on every startup.",
      "Unified control over everyday workflows — Spotify, email, calendar, web search, news, and OS-level controls — through a single voice interface.",
    ],
    whatIDid: [
      "Built a persistent background voice agent using LiveKit Agents with VAD, STT, and TTS.",
      "Designed a LangGraph state graph with a planner node, tool execution node, and responder node for multi-step agentic reasoning.",
      "Integrated ChromaDB for long-term memory — storing personal facts, preferences, and people across sessions.",
      "Built tool integrations across 7 domains: Spotify playback, real-time web search and browsing, news headlines, email reading and sending, OS-level system controls, and calendar management.",
    ],
    reflection:
      "Building IRIS pushed me deep into agentic AI architecture. Designing the planner/responder loop in LangGraph and wiring real-world APIs into a live voice pipeline taught me a lot about latency — every extra tool call is felt by the user, so knowing when to plan vs. when to just respond became the core design challenge.",
  },
  {
    slug: "coach-ai",
    title: "Coach AI - Your Personal AI Coach",
    cardTitle: "Coach AI - Your Personal AI Coach",
    date: "June 2024",
    collaborators: [],
    techs: ["Next JS", "Open AI API", "Vapi API", "Stripe API"],
    cardTechs: ["Next JS", "Stripe", "Open AI API"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/BruhClient/CoachAI",
        icon: "github",
      },
      {
        label: "Live Website",
        href: "https://coach-ai-iota.vercel.app/",
        icon: "presentation",
      },
    ],
    overview:
      "This project involved creating a personal AI coach using Next.js, OpenAI, and Vapi API. The AI coach provides personalized coaching sessions and feedback to users.",
    images: [
      { src: "/projects/coach-ai/cover.png", alt: "cover" },
      { src: "/projects/coach-ai/create.png", alt: "create" },
      { src: "/projects/coach-ai/analytics.png", alt: "analytics" },
      { src: "/projects/coach-ai/coach.png", alt: "coach" },
    ],
    impacts: [
      "Enabled users to create personalised AI coaches for fitness, career, and personal development.",
      "Delivered a voice-first coaching experience accessible directly in the browser.",
      "Monetised the platform with token-based billing through Stripe.",
    ],
    whatIDid: [
      "Integrated Vapi API to enable real-time microphone and speaker voice interactions.",
      "Built full authentication from scratch using Next Auth and Drizzle ORM, including OAuth.",
      "Implemented token billing with Stripe for usage-based payments.",
      "Used ShadCN UI components to build a responsive and accessible interface.",
      "Added smooth animations and transitions with Framer Motion.",
    ],
    reflection:
      "This project was relatively new and had a small user base. Some limitations in code quality led to performance issues, resulting in a less smooth user experience. This could have been improved through better state management and more efficient API call optimization.",
  },
  {
    slug: "millitary-stores-telegram-bot",
    title: "Military Stores Telegram Bot",
    cardTitle: "Millitary Stores Telegram Bot",
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
      "This project involved creating a Telegram bot for managing military stores inventory using Python and Google Sheets API. The bot allows users to interact with the inventory system through Telegram, providing a convenient way to manage stock levels and track items.",
    images: [
      {
        src: "/projects/millitary-stores-telegram-bot/overview.png",
        alt: "cover",
      },
      { src: "/projects/millitary-stores-telegram-bot/bot.png", alt: "create" },
      {
        src: "/projects/millitary-stores-telegram-bot/reporting.png",
        alt: "create",
      },
    ],
    impacts: [
      "Adopted by the unit and actively used for 6 months to manage military stores inventory.",
      "Codebase remains a reference for new bots being developed within the military.",
      "Gave higher-ups a clean, real-time overview of equipment through Google Sheets.",
    ],
    whatIDid: [
      "Built a Telegram bot in Python using the python-telegram-bot library.",
      "Integrated Google Sheets API for inventory data storage and retrieval.",
      "Implemented role-based access control to restrict sensitive features to authorised personnel.",
      "Deployed on Digital Ocean for reliable uptime and accessibility.",
    ],
    reflection:
      "Our bot was adopted by our unit and served for about 6 months . Even without the bot being online , the codebase is still used as a reference for new bots being developed within the military.",
  },
];
