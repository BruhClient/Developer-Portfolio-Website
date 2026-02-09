import { Github, Instagram, Linkedin, Twitter, X } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

const socials = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/travis-ang-5b4b98210/",
    label: "LinkedIn",
  },
  {
    icon: Github,
    href: "https://github.com/travisang",
    label: "GitHub",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/travisang.dev/",
    label: "Instagram",
  },
  {
    icon: Twitter,
    href: "https://twitter.com/travisang_dev",
    label: "X (Twitter)",
  },
];
const SocialLinksBar = () => {
  return (
    <div className="flex gap-2 fixed bottom-5 justify-center w-full">
      {socials.map((social) => {
        const Icon = social.icon;
        return (
          <Button key={social.label} variant="outline" size="icon-lg">
            <Icon />
          </Button>
        );
      })}
    </div>
  );
};

export default SocialLinksBar;
