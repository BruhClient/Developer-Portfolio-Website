"use client";

import { useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { ArrowUpRight, Loader2, Send } from "lucide-react";
import SectionTitle from "./section-title";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { MaskText, Reveal } from "./reveal";
import { ContactSchema, type ContactErrors } from "@/schemas/contact-schema";

const MESSAGE_LIMIT = 500;

const DIRECT_LINKS = [
  { label: "Email", value: "travisang40@gmail.com", href: "mailto:travisang40@gmail.com" },
  { label: "LinkedIn", value: "travis-ang", href: "https://www.linkedin.com/in/travis-ang/" },
  { label: "GitHub", value: "BruhClient", href: "https://github.com/BruhClient" },
];

const Contact = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;

    const result = ContactSchema.safeParse({ email, name, message });

    if (!result.success) {
      // Surface every problem at once, next to the field it belongs to.
      const fieldErrors: ContactErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ContactErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setIsSending(true);

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_KEY || "",
        "template_vlgc8le",
        {
          name: result.data.name,
          message: result.data.message,
          reply_to: result.data.email,
        },
        "jWUYfJ9jY4eJ7NXzG"
      );

      setName("");
      setEmail("");
      setMessage("");
      toast.success("Message sent — I'll get back to you soon.");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      toast.error("Failed to send message. Please try again or email me directly.");
    } finally {
      setIsSending(false);
    }
  };

  const remaining = MESSAGE_LIMIT - message.length;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle title="Get in touch" id="contact" index="06" kicker="Contact" />

      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
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

          <Reveal direction="up" delay={0.16}>
            <dl className="mt-10 space-y-px overflow-hidden rounded-xl border border-border">
              {DIRECT_LINKS.map((link) => (
                <div key={link.label} className="bg-card">
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-secondary"
                  >
                    <dt className="label-mono text-muted-foreground">
                      {link.label}
                    </dt>
                    <dd className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 group-hover:text-primary">
                      {link.value}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </dd>
                  </a>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ── Form ── */}
        <Reveal direction="up" delay={0.08}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Name
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className="h-11"
                />
                {errors.name && (
                  <p
                    id="contact-name-error"
                    role="alert"
                    className="mt-2 text-xs text-destructive"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email
                </label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className="h-11"
                />
                {errors.email && (
                  <p
                    id="contact-email-error"
                    role="alert"
                    className="mt-2 text-xs text-destructive"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label htmlFor="contact-message" className="text-sm font-medium">
                  Message
                </label>
                <span
                  className={`label-mono ${
                    remaining < 0 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {remaining}
                </span>
              </div>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Tell me a little about what you have in mind…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className="min-h-40 resize-y"
              />
              {errors.message && (
                <p
                  id="contact-message-error"
                  role="alert"
                  className="mt-2 text-xs text-destructive"
                >
                  {errors.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSending}
              className="mt-7 h-12 w-full cursor-pointer rounded-full text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed sm:w-auto sm:px-8"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send message
                </>
              )}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;
