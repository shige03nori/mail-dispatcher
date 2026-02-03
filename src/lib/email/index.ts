import { SendEmailArgs, SendEmailResult } from "./types";
import { sendEmailConsole } from "./sender.console";
// import { sendEmailSMTP } from "./sender.smtp";

const MODE = process.env.EMAIL_MODE ?? "console";
// "console" | "smtp"

export async function sendEmail(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  if (MODE === "smtp") {
    // return sendEmailSMTP(args);
  }
  return sendEmailConsole(args);
}
