"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMEQxMTE3Ii8+PC9zdmc+";

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export default function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="w-full cursor-zoom-in block overflow-hidden rounded border border-border hover:border-primary/50 transition-colors duration-200"
        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={src}
          width={500}
          height={500}
          className="rounded w-full h-auto max-h-96 object-cover object-top"
          alt={alt}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out p-4"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={src}
                width={1920}
                height={1080}
                className="object-contain max-h-[90vh] w-auto h-auto max-w-full rounded border border-border"
                alt={alt}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
