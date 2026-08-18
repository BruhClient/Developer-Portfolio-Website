"use client";

import SectionTitle from "./section-title";
import { MaskText, Reveal } from "./reveal";
import { ContactChannels, ContactForm } from "./contact-form";
import { useDeviceStage } from "./device-stage";

/*
  Two ways to reach this form.

  On a pointer-driven desktop the travelling Surface Pro arrives here, squares
  up, and its display becomes the live form — so this section hands the job
  over and lays out a berth for the device instead of rendering a second copy.
  Everywhere else (touch, small screens, reduced motion) the form renders here
  as it always did: a form on a perspective-transformed surface is not a thing
  a phone can use, and the fallback has to be the real one rather than a
  degraded version of the effect.

  The `<section>` itself is outside that branch, and deliberately so. It owns
  the `#contact` anchor, and the navbar's scroll-spy grabs that element once on
  mount and observes it forever. `hostsContactForm` resolves *after* mount, so
  branching above this element would swap the node out from under an observer
  that never looks again, and the Contact tab would stop lighting up.
*/
const Contact = () => {
  const { hostsContactForm } = useDeviceStage();

  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32"
    >
      {hostsContactForm ? (
        <>
          {/*
            No visible heading, no lead, no channels: when the device carries
            the form it carries all of it. A heading printed above the laptop
            that also appears on the laptop reads as the page having failed to
            load rather than as a device. The outline still needs one, so it
            stays as an accessible name only.
          */}
          <h2 className="sr-only">Get in touch</h2>

          {/*
            The device's berth. Empty on purpose. The section is symmetrically
            padded around it, so the berth's centre is the section's centre —
            which is exactly where the stage parks the device when this station
            is reached, with no correction needed.
          */}
          <div aria-hidden="true" data-contact-berth="" className="h-[74svh]" />
        </>
      ) : (
        <>
          {/* Anchoring lives on the section, so this one only needs a slug. */}
          <SectionTitle title="Get in touch" index="06" kicker="Contact" />

          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* ── Invitation + direct links ── */}
            <div>
              <MaskText
                as="p"
                text="Have something you're building? I'd like to hear about it."
                className="font-heading text-2xl leading-tight font-medium tracking-tight sm:text-3xl"
                stagger={0.035}
              />

              <Reveal direction="up" delay={0.1}>
                <p className="measure mt-5 text-base leading-relaxed text-muted-foreground">
                  I&apos;m open to internships, collaborations, and mentorship.
                  The form works, but a direct email is just as welcome.
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
        </>
      )}
    </section>
  );
};

export default Contact;
