import { describe, it, expect } from "vitest";
import { sendEmailConsole } from "./sender.console";

describe("sendEmailConsole", () => {
  it("添付なしでメールを送信して messageId を返す", async () => {
    const result = await sendEmailConsole({
      to: "test@example.com",
      subject: "テスト件名",
      text: "テスト本文",
    });
    expect(result.messageId).toMatch(/^console-\d+$/);
  });

  it("添付ありでメールを送信して messageId を返す", async () => {
    const result = await sendEmailConsole({
      to: "test@example.com",
      subject: "添付テスト",
      text: "添付あり本文",
      attachments: [
        { filename: "report.txt", content: Buffer.from("レポート内容") },
      ],
    });
    expect(result.messageId).toMatch(/^console-\d+$/);
  });

  it("複数添付でも messageId を返す", async () => {
    const result = await sendEmailConsole({
      to: "test@example.com",
      subject: "複数添付",
      text: "複数添付本文",
      attachments: [
        { filename: "a.pdf", content: Buffer.from("pdf内容") },
        { filename: "b.png", content: Buffer.alloc(1024, 0) },
      ],
    });
    expect(result.messageId).toMatch(/^console-\d+$/);
  });

  it("HTML本文と添付ファイルを同時に扱える", async () => {
    const result = await sendEmailConsole({
      to: "test@example.com",
      subject: "HTML+添付",
      text: "テキスト本文",
      html: "<p>HTML本文</p>",
      attachments: [{ filename: "info.csv", content: Buffer.from("a,b\n1,2") }],
    });
    expect(result.messageId).toMatch(/^console-\d+$/);
  });
});
