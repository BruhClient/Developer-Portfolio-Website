"use client";

import { TypeAnimation } from "react-type-animation";

type TypingTextProps = {
  sequence: (string | number | (() => void))[];
  fontSize?: string;
  repeat?: number;
  className?: string;
};

export default function TypingText({
  sequence,
  fontSize = "2em",
  repeat = Infinity,
  className,
}: TypingTextProps) {
  return (
    <TypeAnimation
      sequence={sequence}
      wrapper="span"
      cursor={true}
      repeat={repeat}
      className={className}
      style={{ fontSize, display: "inline-block" }}
    />
  );
}
