"use client";

import { useState } from "react";
import SectionTitle from "./section-title";
import { Input } from "./ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { ContactSchema } from "@/schemas/contact-schema";
import { toast } from "sonner";
import { TerminalWindow } from "./terminal-window";
import { TiltCard } from "./tilt-card";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async () => {
    const result = ContactSchema.safeParse({ email, message, name });

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      toast.error(errorMessage);
      return;
    }

    setIsSending(true);

    toast.promise(
      emailjs.send(
        process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_KEY || "",
        "template_vlgc8le",
        {
          name: result.data.name,
          message: result.data.message,
          reply_to: result.data.email,
        },
        "jWUYfJ9jY4eJ7NXzG",
      ),
      {
        loading: "Sending message...",
        success: () => {
          setName("");
          setEmail("");
          setMessage("");
          setIsSending(false);
          return "Message sent successfully!";
        },
        error: (err) => {
          console.log(err);
          setIsSending(false);
          return "Failed to send message. Please try again.";
        },
      },
    );
  };

  return (
    <div className="space-y-6 mt-4">
      <SectionTitle title="Contact" />

      <TiltCard>
      <TerminalWindow title="mail://travis@dev">
        <div className="space-y-4">
          <p className="text-sm text-primary font-medium">
            Have a project in mind? Let&apos;s connect!
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-12">From:</span>
              <Input
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-0 border-b border-primary/20 rounded-none focus:border-primary px-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-12">Name:</span>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-0 border-b border-primary/20 rounded-none focus:border-primary px-1 text-sm"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">Body:</div>
          <Textarea
            placeholder="> Type your message here..."
            className="bg-transparent border border-primary/20 focus:border-primary rounded text-sm min-h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <Button
            onClick={submit}
            disabled={isSending}
            className="border border-primary text-primary bg-transparent hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </TerminalWindow>
      </TiltCard>
    </div>
  );
};

export default Contact;
