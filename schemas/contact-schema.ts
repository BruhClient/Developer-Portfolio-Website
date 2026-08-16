import z from "zod";

export const ContactSchema = z.object({
  email: z.email({ message: "Enter a valid email address" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(80, { message: "Name is too long" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(500, { message: "Message cannot be longer than 500 characters" }),
});

export type ContactPayload = z.infer<typeof ContactSchema>;

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;
