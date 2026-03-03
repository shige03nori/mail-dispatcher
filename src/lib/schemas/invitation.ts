import { z } from "zod";

export const invitationSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export type InvitationInput = z.infer<typeof invitationSchema>;
