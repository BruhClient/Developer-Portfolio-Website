"use client";

/**
 * The contact form, as it appears in the room's reader panel.
 *
 * It is styled here rather than by the shadcn tokens the primitives default to.
 * Those tokens are the light theme - cream card, coffee button - and the reader
 * is a near-black panel with warm amber on it, so the form arrived looking like
 * a window cut through to a different website. The palette below is the room's
 * own: the amber borders the panel uses, the dark ground the room sits on, and
 * the same soft-amber pill the dock gives the resume.
 */

import { useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ContactSchema, type ContactErrors } from "@/schemas/contact-schema";

const MESSAGE_LIMIT = 500;

/** Section labels in the reader are small amber caps; these match them. */
const LABEL_TEXT = "text-xs uppercase tracking-widest text-amber-200/70";
const LABEL = `mb-2 block ${LABEL_TEXT}`;

/**
 * A field on the room's ground rather than on a white card: the panel is dark,
 * so an input has to be darker than the panel to read as a well rather than a
 * tile. The amber focus ring replaces the default blue, which was the one
 * colour on screen belonging to nothing else.
 */
const FIELD = [
  "border-amber-200/20 bg-[#080a12]/80 text-amber-50",
  /* 50%, not the 30% this started at: against the well that was 2.5:1, which
     is a hint you have to lean in to read. This is 4.9:1. */
  "placeholder:text-amber-100/50",
  "focus-visible:border-amber-200/60 focus-visible:ring-amber-200/25",
  "aria-invalid:border-red-400/70 aria-invalid:ring-red-400/20",
].join(" ");

const ERROR = "mt-2 text-xs text-red-300";

export function ContactForm({
  /** Namespaces the field ids, so two copies could never collide. */
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
      /*
        Barely a card. A hard surface here would be a second panel inside the
        panel; a hairline and the faintest warm wash are enough to say the
        fields belong together.
      */
      className={`rounded-xl border border-amber-200/15 bg-amber-200/3 p-5 sm:p-6 ${className}`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className={LABEL}>
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
            className={`h-11 ${FIELD}`}
          />
          {errors.name && (
            <p id={id("name-error")} role="alert" className={ERROR}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={id("email")} className={LABEL}>
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
            className={`h-11 ${FIELD}`}
          />
          {errors.email && (
            <p id={id("email-error")} role="alert" className={ERROR}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor={id("message")} className={LABEL_TEXT}>
            Message
          </label>
          <span
            /* 55% clears 4.5:1 at this size; 40% did not, and a counter you
               cannot read is just decoration next to the word Message. */
            className={`label-mono ${remaining < 0 ? "text-red-300" : "text-amber-100/55"}`}
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
          className={`min-h-40 resize-y ${FIELD}`}
        />
        {errors.message && (
          <p id={id("message-error")} role="alert" className={ERROR}>
            {errors.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSending}
        /*
          The dock's resume pill, at button size - soft amber on the dark rather
          than the coffee-brown default, so the room's one loud-ish control
          still belongs to the room.
        */
        className="mt-7 h-12 w-full cursor-pointer rounded-full border border-amber-200/50 bg-amber-200/15 text-sm font-medium text-amber-50 transition-colors duration-200 hover:border-amber-200/70 hover:bg-amber-200/25 disabled:cursor-not-allowed sm:w-auto sm:px-8"
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
