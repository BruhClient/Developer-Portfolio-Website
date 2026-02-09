import Collaborators from "@/components/collaborators";
import Masonry from "@/components/masonry";
import ProjectHeader from "@/components/project-header";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";
import emailjs from "@emailjs/browser";
import { Check, Github, Presentation } from "lucide-react";
import CheckText from "@/components/check-text";
import { Button } from "@/components/ui/button";

const MillitaryStoresTelegramBot = () => {
  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="max-w-4xl w-full pt-6 space-y-3  pb-10">
        <ProjectHeader
          name="Military Stores Telegram Bot"
          collaborators={["Justin Ang"]}
          techs={[
            "Python",
            "Google Sheets API",
            "Telegram Bot API",
            "Digital Ocean",
          ]}
        />

        <Button asChild>
          <a
            href="https://github.com/BruhClient/ISR-Stores-Bot"
            target="_blank"
          >
            <Github />
            GitHub
          </a>
        </Button>

        <Separator />
        <div className="text-lg">Project Overview</div>
        <div>
          This project involved creating a Telegram bot for managing military
          stores inventory using Python and Google Sheets API. The bot allows
          users to interact with the inventory system through Telegram,
          providing a convenient way to manage stock levels and track items.
        </div>

        <Masonry>
          <Image
            src={"/project/millitary-stores-telegram-bot/overview.png"}
            width={500}
            height={500}
            className="rounded-sm"
            alt="cover"
          />
          <Image
            src={"/project/millitary-stores-telegram-bot/bot.png"}
            width={500}
            height={500}
            className="rounded-sm"
            alt="create"
          />
          <Image
            src={"/project/millitary-stores-telegram-bot/reporting.png"}
            width={500}
            height={500}
            className="rounded-sm"
            alt="create"
          />
        </Masonry>

        <div>
          The bot also had roles and permissions to ensure that only authorized
          users could access certain features. This added a layer of security to
          the inventory management system. Everything was stored neatly into
          google sheets so that higher ups could have a good overview of
          equipment. The project was deployed on Digital Ocean, ensuring
          reliable uptime and accessibility. Due to the sensitivity of millitary
          data , the bot was made offline after my release from service.
        </div>

        <div className="space-y-3">
          <CheckText text="Developed a Telegram bot using Python and the python-telegram-bot library to manage military stores inventory." />
          <CheckText text="Integrated Google Sheets API to store and retrieve inventory data, allowing for easy access and management." />
          <CheckText text="Implemented role-based access control to ensure that only authorized personnel could access sensitive inventory information." />
          <CheckText text="Deployed the bot on Digital Ocean, ensuring reliable uptime and accessibility for users." />
        </div>
        <div>
          Our bot was adopted by our unit and served for about 6 months . Even
          without the bot being online , the codebase is still used as a
          reference for new bots being developed within the military.
        </div>
      </div>
    </div>
  );
};

export default MillitaryStoresTelegramBot;
