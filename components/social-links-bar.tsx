"use client";

import { Github, Instagram, Linkedin, Twitter, X } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const socials = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/travis-ang/",
    label: "LinkedIn",
  },
  {
    icon: Github,
    href: "https://github.com/BruhClient",
    label: "GitHub",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/____travisang____/",
    label: "Instagram",
  },
  {
    icon: Twitter,
    href: "https://twitter.com/travisang_dev",
    label: "X (Twitter)",
  },
];
const SocialLinksBar = () => {
  const router = useRouter();
  return (
    <div className="flex gap-2 fixed bottom-5 justify-center w-full">
      {socials.map((social) => {
        const Icon = social.icon;
        return (
          <Button
            key={social.label}
            variant={"secondary"}
            size="icon-lg"
            onClick={() => router.push(social.href)}
          >
            <Icon />
          </Button>
        );
      })}
    </div>
  );
};

export default SocialLinksBar;
