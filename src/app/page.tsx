import Lockup from "@/components/Lockup";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import SectionHead from "@/components/SectionHead";
import Nav from "@/components/Nav";

// NOTE: this page remains placeholder content for verifying Task 6's shared
// primitives (Lockup, Button, Eyebrow, SectionHead) and Task 7's Nav. It
// will be replaced by the real home page in Task 12.
export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col items-center gap-4 px-6 py-32 text-center">
      <h1 className="font-display text-4xl font-bold">
        Built for the <span className="kx-grad">agentic</span> era
      </h1>
      <p className="max-w-xl text-on-dark-2">
        Design tokens and self-hosted fonts are wired up. This placeholder
        page will be replaced in a later task.
      </p>

      <section className="mt-16 flex w-full max-w-3xl flex-col items-center gap-6 rounded-2xl border border-rule bg-dark-panel px-8 py-10">
        <Eyebrow context="dark">Dark context primitives</Eyebrow>
        <Lockup />
        <SectionHead context="dark">Section headline on dark</SectionHead>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" href="/">
            Start free
          </Button>
          <Button variant="ghost" href="/">
            Ghost button
          </Button>
        </div>
      </section>

      <section className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-surface px-8 py-10 text-ink">
        <Eyebrow context="light">Light context primitives</Eyebrow>
        <SectionHead context="light">Section headline on light</SectionHead>
        <Button variant="accent" href="/">
          Accent button
        </Button>
      </section>
    </main>
    </>
  );
}
