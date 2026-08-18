"use client";

/**
 * The contact form and direct channels, extracted so one implementation can
 * serve two surfaces: the ordinary page section, and the Surface Pro's display
 * once the travelling device reaches the contact station and the panel becomes
 * live DOM rather than a painted texture.
 *
 * There is only ever one of these mounted — the section renders the form or
 * yields the job to the device, never both — so the emailjs wiring, the schema
 * and the field ids exist in exactly one place.
 */

import { useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { ArrowUpRight, Loader2, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ContactSchema, type ContactErrors } from "@/schemas/contact-schema";
import { CONTACT_CHANNELS } from "@/constants/contact";

const MESSAGE_LIMIT = 500;

/** Direct channels, as a definition list. */
export function ContactChannels({ idPrefix = "page" }: { idPrefix?: string }) {
  return (
    <dl className="space-y-px overflow-hidden rounded-xl border border-border">
      {CONTACT_CHANNELS.map((link) => {
        const external = link.href.startsWith("http");
        return (
          <div key={`${idPrefix}-${link.label}`} className="bg-card">
            <a
              href={link.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 hover:bg-secondary"
            >
              <dt className="label-mono text-muted-foreground">{link.label}</dt>
              <dd className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 group-hover:text-primary">
                {link.value}
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </dd>
            </a>
          </div>
        );
      })}
    </dl>
  );
}

export function ContactForm({
  /** Namespaces the field ids, so the page and panel copies can never collide. */
  idPrefix = "contact",
  className = "",
}: {
  idPrefix?: string;
  className?: string;
}) {
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
      toast.success("Message sent. I'll get back to you soon.");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      toast.error("Failed to send message. Please try again or email me directly.");
    } finally {
      setIsSending(false);
    }
  };

  const remaining = MESSAGE_LIMIT - message.length;
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`rounded-xl border border-border bg-card p-6 sm:p-8 ${className}`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className="mb-2 block text-sm font-medium">
            Name
          </label>
          <Input
            id={id("name")}
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? id("name-error") : undefined}
            className="h-11"
          />
          {errors.name && (
            <p id={id("name-error")} role="alert" className="mt-2 text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={id("email")} className="mb-2 block text-sm font-medium">
            Email
          </label>
          <Input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? id("email-error") : undefined}
            className="h-11"
          />
          {errors.email && (
            <p id={id("email-error")} role="alert" className="mt-2 text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor={id("message")} className="text-sm font-medium">
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
          id={id("message")}
          name="message"
          placeholder="Tell me a little about what you have in mind…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? id("message-error") : undefined}
          className="min-h-40 resize-y"
        />
        {errors.message && (
          <p id={id("message-error")} role="alert" className="mt-2 text-xs text-destructive">
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
  );
}
