import nodemailer from "nodemailer";
import { SendEmailArgs, SendEmailResult } from "./types";

export async function sendEmailSMTP(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });

  return {
    messageId: info.messageId,
  };
}
