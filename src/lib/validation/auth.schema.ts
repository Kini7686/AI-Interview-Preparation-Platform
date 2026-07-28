import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
