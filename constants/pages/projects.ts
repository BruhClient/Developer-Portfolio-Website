import { PageData } from "./types";

export const PROJECTS: PageData[] = [
  {
    slug: "coach-ai",
    title: "Coach AI - Your Personal AI Coach",
    cardTitle: "Coach AI",
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
      { src: "/project/coach-ai/cover.png", alt: "cover" },
      { src: "/project/coach-ai/create.png", alt: "create" },
      { src: "/project/coach-ai/analytics.png", alt: "analytics" },
      { src: "/project/coach-ai/coach.png", alt: "coach" },
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
        src: "/project/millitary-stores-telegram-bot/overview.png",
        alt: "cover",
      },
      { src: "/project/millitary-stores-telegram-bot/bot.png", alt: "create" },
      {
        src: "/project/millitary-stores-telegram-bot/reporting.png",
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
  {
    slug: "calc-gpa",
    title: "CaclGPA -  GPA Calculator",
    cardTitle: "CalcGPA",
    date: "June 2024",
    collaborators: [],
    techs: ["Expo", "React Native", "TypeScript"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/BruhClient/CalcGPA",
        icon: "github",
      },
    ],
    overview:
      "This Project is a GPA Calculator app built using Expo and React Native. It allows users to easily calculate their Grade Point Average (GPA) by inputting their course grades and credit hours. The app features a user-friendly interface, making it simple for students to track their academic performance. With real-time calculations and a clean design, CalcGPA is an essential tool for students aiming to monitor and improve their GPA.",
    images: [
      { src: "/project/calc-gpa/cover.jpg", alt: "cover" },
      { src: "/project/calc-gpa/create.jpg", alt: "create" },
      { src: "/project/calc-gpa/socials.jpg", alt: "socials" },
      { src: "/project/calc-gpa/gpa.jpg", alt: "gpa" },
    ],
    impacts: [
      "Gave students a simple, offline-friendly tool to track and calculate their GPA.",
      "Published as a fully functional mobile app available via Expo.",
    ],
    whatIDid: [
      "Built a mobile app from scratch using React Native and Expo.",
      "Designed a clean, intuitive UI with responsive layout for different screen sizes.",
      "Managed app state using React hooks, Context API, and local storage.",
    ],
    reflection:
      "This project helped me gain valuable experience in mobile app development, user experience design, and working with mobile local storage. It also improved my problem-solving skills as I navigated challenges related to mobile platforms and performance optimization.",
  },
];
