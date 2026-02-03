import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailArgs) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP env vars missing. Please set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465ならtrue
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: info.messageId,
  };
}
