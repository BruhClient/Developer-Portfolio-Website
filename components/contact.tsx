"use client";

import SectionTitle from "./section-title";
import { Reveal } from "./reveal";
import { ContactChannels, ContactForm } from "./contact-form";

/*
  One way to reach this form, on every device.

  The travelling Surface Pro used to arrive here on desktop and turn its
  display into the live form, which meant this section had to render either a
  berth or a real form depending on viewport and pointer type. The device is a
  hero element now, so that branch is gone: this is an ordinary form that works
  the same at every width.
*/
const Contact = () => {
  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32"
    >
      {/* Anchoring lives on the section, so this one only needs a slug. */}
      <SectionTitle title="Get in touch" index="06" kicker="Contact" />

      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* ── Invitation + direct links ── */}
        <div>
          <Reveal>
            <p className="font-heading text-2xl leading-tight font-medium tracking-tight sm:text-3xl">
              Have something you&apos;re building? I&apos;d like to hear about
              it.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <p className="measure mt-5 text-base leading-relaxed text-muted-foreground">
              I&apos;m open to internships, collaborations, and mentorship. The
              form works, but a direct email is just as welcome.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.16} className="mt-10">
            <ContactChannels />
          </Reveal>
        </div>

        {/* ── Form ── */}
        <Reveal direction="up" delay={0.08}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;
