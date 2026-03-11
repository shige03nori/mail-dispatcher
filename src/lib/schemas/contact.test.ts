import { describe, it, expect } from "vitest";
import { contactSchema } from "./contact";

describe("contactSchema", () => {
  it("氏名・メールが正しければ通過する", () => {
    const result = contactSchema.safeParse({ name: "山田太郎", email: "yamada@example.com" });
    expect(result.success).toBe(true);
  });

  it("氏名が空のとき失敗する", () => {
    const result = contactSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("氏名は必須です");
  });

  it("メールアドレスが不正な形式のとき失敗する", () => {
    const result = contactSchema.safeParse({ name: "山田太郎", email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("メールアドレスの形式が正しくありません");
  });

  it("メールアドレスが空文字のとき通過する（任意項目）", () => {
    const result = contactSchema.safeParse({ name: "山田太郎", email: "" });
    expect(result.success).toBe(true);
  });

  it("メールアドレスが未指定のとき通過する（デフォルト空文字）", () => {
    const result = contactSchema.safeParse({ name: "山田太郎" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("");
  });

  it("groupIds未指定のときデフォルト空配列になる", () => {
    const result = contactSchema.safeParse({ name: "山田太郎" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.groupIds).toEqual([]);
  });

  it("groupIdsにUUID配列を指定できる", () => {
    const ids = ["aaa-111", "bbb-222"];
    const result = contactSchema.safeParse({ name: "山田太郎", groupIds: ids });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.groupIds).toEqual(ids);
  });
});
