import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyVars, toErrorMessage } from "./processCampaign";
import { processCampaign } from "./processCampaign";

// ─── モック設定 ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailCampaign: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    emailCampaignRecipient: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    contact: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: {
    readdir: vi.fn().mockResolvedValue([]),
    readFile: vi.fn(),
  },
  readdir: vi.fn().mockResolvedValue([]),
  readFile: vi.fn(),
}));

// ─── applyVars ───────────────────────────────────────────────
describe("applyVars", () => {
  const contact = {
    name: "山田太郎",
    companyName: "ヤマダ株式会社",
    email: "yamada@example.com",
    phone: "090-1234-5678",
  };

  it("{{name}} を氏名に置換する", () => {
    expect(applyVars("こんにちは、{{name}}さん", contact)).toBe("こんにちは、山田太郎さん");
  });

  it("{{companyName}} を会社名に置換する", () => {
    expect(applyVars("{{companyName}} 御中", contact)).toBe("ヤマダ株式会社 御中");
  });

  it("{{email}} をメールアドレスに置換する", () => {
    expect(applyVars("登録メール: {{email}}", contact)).toBe("登録メール: yamada@example.com");
  });

  it("{{phone}} を電話番号に置換する", () => {
    expect(applyVars("TEL: {{phone}}", contact)).toBe("TEL: 090-1234-5678");
  });

  it("複数の変数を同時に置換する", () => {
    const result = applyVars("{{name}} ({{companyName}}) <{{email}}>", contact);
    expect(result).toBe("山田太郎 (ヤマダ株式会社) <yamada@example.com>");
  });

  it("同じ変数が複数回出現してもすべて置換する", () => {
    expect(applyVars("{{name}}様 {{name}}様", contact)).toBe("山田太郎様 山田太郎様");
  });

  it("変数がないテンプレートはそのまま返す", () => {
    expect(applyVars("変数なし本文", contact)).toBe("変数なし本文");
  });

  it("companyName が null のとき空文字に置換する", () => {
    const c = { ...contact, companyName: null };
    expect(applyVars("{{companyName}} 御中", c)).toBe(" 御中");
  });
});

// ─── toErrorMessage ──────────────────────────────────────────
describe("toErrorMessage", () => {
  it("Error オブジェクトから message を返す", () => {
    expect(toErrorMessage(new Error("SMTP接続失敗"))).toBe("SMTP接続失敗");
  });

  it("文字列はそのまま返す", () => {
    expect(toErrorMessage("タイムアウト")).toBe("タイムアウト");
  });

  it("オブジェクトは JSON 文字列にして返す", () => {
    const result = toErrorMessage({ code: 500 });
    expect(result).toBe('{"code":500}');
  });

  it("null は JSON 文字列 'null' を返す", () => {
    expect(toErrorMessage(null)).toBe("null");
  });
});

// ─── processCampaign（バッチ送信） ───────────────────────────
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import fs from "fs/promises";

describe("processCampaign", () => {

  const campaignId = "campaign-001";

  const mockCampaign = {
    subjectSnapshot: "{{name}}様へのご案内",
    textBodySnapshot: "{{companyName}}の{{name}}様、こんにちは。",
    htmlBodySnapshot: null,
  };

  const mockRecipients = [
    {
      id: "rec-1",
      emailSnapshot: "yamada@example.com",
      contactNameSnapshot: "山田太郎",
      contactId: "contact-1",
    },
    {
      id: "rec-2",
      emailSnapshot: "suzuki@example.com",
      contactNameSnapshot: "鈴木花子",
      contactId: "contact-2",
    },
  ];

  const mockContacts = [
    { id: "contact-1", name: "山田太郎", companyName: "ヤマダ株式会社", email: "yamada@example.com", phone: "090-1111-1111" },
    { id: "contact-2", name: "鈴木花子", companyName: "スズキ株式会社", email: "suzuki@example.com", phone: "090-2222-2222" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.emailCampaign.findUnique).mockResolvedValue(mockCampaign as never);
    vi.mocked(prisma.emailCampaignRecipient.findMany)
      .mockResolvedValueOnce(mockRecipients as never) // PENDING 分
      .mockResolvedValueOnce(mockRecipients.map((r) => ({ ...r, status: "PENDING" })) as never); // 集計用
    vi.mocked(prisma.contact.findMany).mockResolvedValue(mockContacts as never);
    vi.mocked(prisma.emailCampaignRecipient.update).mockResolvedValue({} as never);
    vi.mocked(prisma.emailCampaign.update).mockResolvedValue({} as never);
    vi.mocked(sendEmail).mockResolvedValue({ messageId: "msg-001" });
  });

  it("全員に送信成功したときキャンペーンを SENT で更新する", async () => {
    await processCampaign(campaignId);

    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(prisma.emailCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SENT", sentCount: 2, failedCount: 0 }),
      })
    );
  });

  it("差し込み変数が正しく置換されてから送信される", async () => {
    await processCampaign(campaignId);

    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "yamada@example.com",
        subject: "山田太郎様へのご案内",
        text: "ヤマダ株式会社の山田太郎様、こんにちは。",
      })
    );
  });

  it("添付ファイルがある場合に sendEmail に渡される", async () => {
    vi.mocked(fs.readdir).mockResolvedValue(["document.pdf"] as never);
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from("pdf内容") as never);

    await processCampaign(campaignId);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [{ filename: "document.pdf", content: expect.any(Buffer) }],
      })
    );
  });

  it("1件でも送信失敗したときキャンペーンを FAILED で更新する", async () => {
    vi.mocked(sendEmail)
      .mockResolvedValueOnce({ messageId: "msg-001" })
      .mockRejectedValueOnce(new Error("SMTP失敗"));

    await processCampaign(campaignId);

    expect(prisma.emailCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED", sentCount: 1, failedCount: 1 }),
      })
    );
  });

  it("送信失敗した宛先レコードを FAILED で更新する", async () => {
    vi.mocked(sendEmail)
      .mockResolvedValueOnce({ messageId: "msg-001" })
      .mockRejectedValueOnce(new Error("SMTP失敗"));

    await processCampaign(campaignId);

    expect(prisma.emailCampaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rec-2" },
        data: expect.objectContaining({ status: "FAILED", errorMessage: "SMTP失敗" }),
      })
    );
  });

  it("キャンペーンが存在しない場合は何もしない", async () => {
    vi.mocked(prisma.emailCampaign.findUnique).mockResolvedValue(null);

    await processCampaign("nonexistent");

    expect(sendEmail).not.toHaveBeenCalled();
    expect(prisma.emailCampaign.update).not.toHaveBeenCalled();
  });
});
