import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  companyName: z.string().optional().default(""),
  email: z
    .string()
    .optional()
    .default("")
    .refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "メールアドレスの形式が正しくありません"
    ),
  phone: z.string().optional().default(""),
  note: z.string().optional().default(""),
  groupIds: z.array(z.string()).optional().default([]),
});

export type ContactInput = z.infer<typeof contactSchema>;
