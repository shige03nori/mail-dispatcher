import { describe, it, expect } from "vitest";
import { templateSchema } from "./template";

describe("templateSchema", () => {
  it("必須項目がすべて揃っているとき通過する", () => {
    const result = templateSchema.safeParse({
      name: "テンプレ名",
      subject: "件名テスト",
      textBody: "本文テキスト",
    });
    expect(result.success).toBe(true);
  });

  it("テンプレ名が空のとき失敗する", () => {
    const result = templateSchema.safeParse({ name: "", subject: "件名", textBody: "本文" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("テンプレ名は必須です");
  });

  it("件名が空のとき失敗する", () => {
    const result = templateSchema.safeParse({ name: "名前", subject: "", textBody: "本文" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("件名は必須です");
  });

  it("本文（text）が空のとき失敗する", () => {
    const result = templateSchema.safeParse({ name: "名前", subject: "件名", textBody: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("本文（text）は必須です");
  });

  it("htmlBodyが未指定のときデフォルト空文字になる", () => {
    const result = templateSchema.safeParse({ name: "名前", subject: "件名", textBody: "本文" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.htmlBody).toBe("");
  });

  it("htmlBodyを指定したとき保持される", () => {
    const result = templateSchema.safeParse({
      name: "名前",
      subject: "件名",
      textBody: "本文",
      htmlBody: "<p>HTML本文</p>",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.htmlBody).toBe("<p>HTML本文</p>");
  });
});
