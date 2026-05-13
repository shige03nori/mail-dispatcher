import nodemailer from "nodemailer";
import { SendEmailArgs, SendEmailResult } from "./types";

// TODO: nodemailer を使って SMTP 経由でメールを送信する関数を実装する
// ヒント: nodemailer.createTransport({ host, port, auth: { user, pass } }) でトランスポーター作成
//         環境変数 SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM を使う
// ヒント: transporter.sendMail({ from, to, subject, text, html, attachments }) で送信
// ヒント: attachments は args.attachments を { filename, content } の配列にマッピングする
// ヒント: sendMail の戻り値 info.messageId を { messageId } として返す
export async function sendEmailSMTP(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  throw new Error("TODO: sendEmailSMTP を実装してください");
}
