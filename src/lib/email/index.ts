import { SendEmailArgs, SendEmailResult } from "./types";
import { sendEmailConsole } from "./sender.console";
import { sendEmailSMTP } from "./sender.smtp";

// TODO: EMAIL_MODE 環境変数に応じてコンソール送信と SMTP 送信を切り替える関数を実装する
// ヒント: process.env.EMAIL_MODE === "smtp" なら sendEmailSMTP を、それ以外は sendEmailConsole を呼ぶ
// ヒント: デフォルトは "console" モード（未設定時は実際のメール送信をしない）
export async function sendEmail(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  throw new Error("TODO: sendEmail を実装してください");
}
