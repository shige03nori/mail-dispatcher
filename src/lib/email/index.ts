import { SendEmailArgs, SendEmailResult } from "./types";
import { sendEmailConsole } from "./sender.console";
// import { sendEmailSMTP } from "./sender.smtp";

// デモモード時はメール送信を強制的にコンソール出力にする
const MODE =
  process.env.DEMO_MODE === "true" ? "console" : (process.env.EMAIL_MODE ?? "console");
// "console" | "smtp"

export async function sendEmail(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  if (MODE === "smtp") {
    // return sendEmailSMTP(args);
  }
  return sendEmailConsole(args);
}
