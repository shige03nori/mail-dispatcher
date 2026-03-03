import { z } from "zod";

export const templateSchema = z.object({
  name: z.string().min(1, "テンプレ名は必須です"),
  subject: z.string().min(1, "件名は必須です"),
  textBody: z.string().min(1, "本文（text）は必須です"),
  htmlBody: z.string().optional().default(""),
});

export type TemplateInput = z.infer<typeof templateSchema>;
