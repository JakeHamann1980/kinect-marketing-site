import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";

interface Logo {
  src: string;
  alt: string;
}

interface LogoStripProps {
  /** home.logoStrip.eyebrow -- the mono label above the logo row. */
  eyebrow: string;
  /**
   * Customer logo slots (design-reference/README.md "2. Customer logo strip
   * (dark)"). Empty today -- there are no real customer logos yet. Per the
   * README's own instruction ("Currently empty placeholders... remove the
   * strip entirely until there are real logos to show") this component
   * returns null rather than rendering six empty slots, but keeps the built
   * structure (six 132x44 object-fit:contain slots at 55% opacity, mono
   * eyebrow above) behind this prop so mounting real logos later is a
   * one-line content change, not a rebuild.
   *
   * TODO: do not ship empty. Replace with real customer logos (SVG
   * preferred) before launch -- see README "Gaps / Decisions Needed" #5.
   */
  logos?: Logo[];
}

export default function LogoStrip({ eyebrow, logos = [] }: LogoStripProps) {
  if (logos.length === 0) return null;

  return (
    <section className="border-b border-[rgba(255,255,255,.06)] bg-dark-canvas px-[60px] pt-[26px] pb-[64px]">
      <div className="mx-auto max-w-[1080px]">
        <Eyebrow context="dark" className="block text-center text-[12px]">
          {eyebrow}
        </Eyebrow>
        <div className="mt-[26px] flex flex-wrap items-center justify-center gap-x-[44px] gap-y-5">
          {logos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={132}
              height={44}
              className="h-[44px] w-[132px] object-contain opacity-55"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
