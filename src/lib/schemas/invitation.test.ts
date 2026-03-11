import { describe, it, expect } from "vitest";
import { invitationSchema } from "./invitation";

describe("invitationSchema", () => {
  it("正しいメール・ロールで通過する", () => {
    const result = invitationSchema.safeParse({ email: "editor@example.com", role: "EDITOR" });
    expect(result.success).toBe(true);
  });

  it("VIEWER ロールで通過する", () => {
    const result = invitationSchema.safeParse({ email: "viewer@example.com", role: "VIEWER" });
    expect(result.success).toBe(true);
  });

  it("メールアドレスが不正な形式のとき失敗する", () => {
    const result = invitationSchema.safeParse({ email: "invalid", role: "EDITOR" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("有効なメールアドレスを入力してください");
  });

  it("メールアドレスが空のとき失敗する", () => {
    const result = invitationSchema.safeParse({ email: "", role: "EDITOR" });
    expect(result.success).toBe(false);
  });

  it("ロールが ADMIN のとき失敗する（EDITOR/VIEWER のみ許可）", () => {
    const result = invitationSchema.safeParse({ email: "admin@example.com", role: "ADMIN" });
    expect(result.success).toBe(false);
  });

  it("ロールが不正な値のとき失敗する", () => {
    const result = invitationSchema.safeParse({ email: "test@example.com", role: "SUPERUSER" });
    expect(result.success).toBe(false);
  });
});
