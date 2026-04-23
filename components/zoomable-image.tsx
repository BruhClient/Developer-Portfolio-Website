"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+";

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export default function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

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
        className="w-full cursor-zoom-in block"
      >
        <Image
          src={src}
          width={500}
          height={500}
          className="rounded-sm w-full h-auto max-h-96 object-cover object-top"
          alt={alt}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-zoom-out p-4"
          onClick={() => setOpen(false)}
        >
          <Image
            src={src}
            width={1920}
            height={1080}
            className="object-contain max-h-[90vh] w-auto h-auto max-w-full rounded-sm"
            alt={alt}
          />
        </div>
      )}
    </>
  );
}
