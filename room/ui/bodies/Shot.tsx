import Image from "next/image";
import { sizeOf } from "@/constants/imageSizes";
import type { PageImage } from "@/constants/pages/types";

/*
  Pictures in the reader.

  Shared by every body that shows imagery so the sizing rules are decided once.
  They used to be written out at each `<Image>`, which is how both call sites
  ended up passing the same hardcoded 880x550 for pictures whose real shapes
  run from a 0.67 standing infographic to a 6.32 strip chart.
*/

/*
  Narrower than the narrowest column it could land in, so an image under this
  can never fill its slot on any screen and blowing it up to try would only
  cost sharpness. One screenshot in the set is a 208px terminal table.
*/
const NARROWER_THAN_ANY_COLUMN = 210;

/*
  Past this, a picture is a strip rather than a shot, and half a panel is not
  enough for it: the widest chart here is 6.32:1, which in a 320px column comes
  out 51px tall with axis labels in it. Those get the full width and the
  masonry closes up around them.

  Three rather than something tighter because the rule has to earn its
  interruption. At 2.4 it caught four of one hackathon's six images and the
  masonry had nothing left to lay out.
*/
const PANORAMIC = 3;

/** What fraction of the viewport a picture occupies, for picking a source. */
const SIZES_FULL = "(min-width: 768px) 45vw, 100vw";
const SIZES_COLUMN = "(min-width: 768px) 23vw, 100vw";

export function Shot({
  image,
  className,
  sizes = SIZES_FULL,
}: {
  image: PageImage;
  className?: string;
  sizes?: string;
}) {
  const { width, height } = sizeOf(image.src);
  const native = width < NARROWER_THAN_ANY_COLUMN;

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
        What the picture is: the reader is the right 45% of a desktop window
        and the full width of a phone, and a gallery splits that again. Without
        this next/image assumes `width` above is the display size and picks a
        source off that, which for a 2880px photo meant fetching a 2880px photo
        to draw it 320px wide.
      */
      sizes={sizes}
      className={["reader-shot", native && "reader-shot--native", className]
        .filter(Boolean)
        .join(" ")}
      style={native ? { maxWidth: width } : undefined}
    />
  );
}

/*
  A project's or hackathon's shots, packed.

  Masonry rather than a stack: these run six deep in places, and a column of
  full-width screenshots turns the interesting part of a panel - what was
  built - into a scroll. Packed two-up you see the set at once.

  Column WIDTH rather than a column count, so the number of columns follows
  the space instead of a breakpoint. The reader is 45vw, which is 648px on a
  laptop and 460px on a small window, and 290 gives two columns at the first
  and one at the second without a media query saying so. The phone sheet gets
  one column, which is the stack again, correctly.
*/
export function Gallery({ images }: { images: readonly PageImage[] }) {
  if (images.length === 0) return null;

  return (
    <div className="reader-bleed reader-gallery">
      {images.map((image) => {
        const { width, height } = sizeOf(image.src);
        const wide = width / height >= PANORAMIC;
        return (
          <Shot
            key={image.src}
            image={image}
            className={wide ? "reader-shot--wide" : undefined}
            sizes={wide ? SIZES_FULL : SIZES_COLUMN}
          />
        );
      })}
    </div>
  );
}
