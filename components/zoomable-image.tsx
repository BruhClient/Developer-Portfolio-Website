"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LIGHTBOX_BLUR_DATA_URL } from "@/constants/media";

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
      <button
        onClick={() => setOpen(true)}
        aria-label={`Enlarge image: ${alt}`}
        // The frame stays put and only the image scales, so neighbouring
        // masonry items never shift on hover.
        className="group block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border transition-colors duration-200 hover:border-foreground/25"
      >
        <Image
          src={src}
          width={500}
          height={500}
          className="h-auto max-h-96 w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          alt={alt}
          placeholder="blur"
          blurDataURL={LIGHTBOX_BLUR_DATA_URL}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? {} : { scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={src}
                width={1920}
                height={1080}
                className="h-auto max-h-[90vh] w-auto max-w-full rounded-xl object-contain"
                alt={alt}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
