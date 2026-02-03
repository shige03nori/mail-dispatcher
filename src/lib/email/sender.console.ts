import { SendEmailArgs, SendEmailResult } from "./types";

export async function sendEmailConsole(
  args: SendEmailArgs
): Promise<SendEmailResult> {
  console.log("=== EMAIL (console) ===");
  console.log("to:", args.to);
  console.log("subject:", args.subject);
  console.log("text:", args.text);
  if (args.html) console.log("html:", args.html);
  console.log("=======================");

  return {
    messageId: `console-${Date.now()}`,
  };
}

// export async function sendEmailConsole(args: SendEmailArgs): Promise<SendEmailResult> {
//   // ★テスト用: 件名に [FAIL] が入っていたら失敗させる
//   if (args.subject.includes("[FAIL]")) {
//     throw new Error("TEST_FAIL: forced failure by subject");
//   }

//   console.log("=== EMAIL (console) ===");
//   console.log("to:", args.to);
//   console.log("subject:", args.subject);
//   console.log("text:", args.text);
//   if (args.html) console.log("html:", args.html);
//   console.log("=======================");

//   return { messageId: `console-${Date.now()}` };
// }
