import Image from "next/image";
import { sizeOf } from "@/constants/imageSizes";
import type { PageImage } from "@/constants/pages/types";

/*
  One picture in the reader, at full bleed.

  Shared by every body that shows imagery so the sizing rules are decided once.
  They used to be written out at each `<Image>`, which is how both call sites
  ended up passing the same hardcoded 880x550 for pictures whose real shapes
  run from a 0.67 standing infographic to a 6.32 strip chart.
*/

/*
  Narrower than the narrowest reader - the mobile sheet on a small phone - so
  an image under this can never fill the panel on any screen, and blowing it up
  to try would only cost sharpness. Everything at or above it goes full width
  everywhere.
*/
const NARROWER_THAN_ANY_READER = 420;

export function Shot({ image, className }: { image: PageImage; className?: string }) {
  const { width, height } = sizeOf(image.src);
  const native = width < NARROWER_THAN_ANY_READER;

  return (
    <Image
      src={image.src}
      alt={image.alt}
      /*
        The real pixels, from the measured table. These do not decide the
        rendered shape - the browser takes that from the file once it arrives -
        they decide the space held open until it does, which is the difference
        between a panel that settles and one that lurches.
      */
      width={width}
      height={height}
      /*
        What the panel is: the right 45% of a desktop window, the full width of
        a phone. Without this next/image assumes the `width` above is the
        display size and picks a source off that, which for a 2880px photo
        meant fetching a 2880px photo to draw it 648px wide.
      */
      sizes="(min-width: 768px) 45vw, 100vw"
      className={["reader-shot", native && "reader-shot--native", className]
        .filter(Boolean)
        .join(" ")}
      style={native ? { maxWidth: width } : undefined}
    />
  );
}
