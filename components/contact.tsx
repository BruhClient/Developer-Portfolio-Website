"use client";

import React, { useState } from "react";
import SectionTitle from "./section-title";
import { Input } from "./ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { ContactSchema } from "@/schemas/contact-schema";
import { toast } from "sonner";

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
          name,
          message: result.data.message,
          reply_to: result.data.email,
        },
        "jWUYfJ9jY4eJ7NXzG",
      ),
      {
        loading: "Sending message...",
        success: () => {
          // reset form fields on success
          setName("");
          setEmail("");
          setMessage("");
          setIsSending(false);
          return "Message sent successfully!";
        },
        error: (err) => {
          console.log(err?.text);
          setIsSending(false);
          return "Failed to send message. Please try again.";
        },
      },
    );
  };

  return (
    <div className="space-y-4 mt-4">
      <SectionTitle title="Contact" />
      <div className="text-xl text-accent">
        Have a project in mind? Let's connect!
      </div>

      <Input
        placeholder="Email Address"
        className="max-w-lg"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Name"
        className="max-w-lg"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        placeholder="Your Message"
        className="max-h-64 min-h-32"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={submit}
        disabled={isSending}
        className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
        {isSending ? "Sending..." : "Send Message"}
      </Button>
    </div>
  );
};

export default Contact;
