"use client";

import { useState } from "react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { TypingEffect } from "./typing-effect";

const SectionTitle = ({ title }: { title: string }) => {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [typingDone, setTypingDone] = useState(false);

  return (
    <div className="mb-6" id={slug} ref={ref}>
      <h2 className="text-lg md:text-xl font-semibold text-foreground">
        {isInView ? (
          <TypingEffect
            text={title}
            speed={50}
            onComplete={() => setTypingDone(true)}
            showCursor={!typingDone}
          />
        ) : (
          <span className="opacity-0">{title}</span>
        )}
      </h2>
      {typingDone && (
        <div className="mt-1 text-primary/40 text-xs">
          ────────────────────────────
        </div>
      )}
    </div>
  );
};

export default SectionTitle;
