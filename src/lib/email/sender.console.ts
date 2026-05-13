import { SendEmailArgs, SendEmailResult } from "./types";

// TODO: メール送信をシミュレートしてコンソールに内容を出力する関数を実装する
// ヒント: console.log() で to / subject / text / html をそれぞれ出力する
// ヒント: 戻り値は { messageId: `console-${Date.now()}` } のような一意な文字列を返す
// ヒント: 添付ファイル(attachments)があればファイル名とサイズも出力すると親切
export async function sendEmailConsole(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  throw new Error("TODO: sendEmailConsole を実装してください");
}
