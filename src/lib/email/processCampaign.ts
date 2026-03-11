import path from "path";
import fs from "fs/promises";
import { CampaignStatus, RecipientStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { Attachment } from "@/lib/email/types";

export function applyVars(
  template: string,
  c: { name: string; companyName: string | null; email: string | null; phone: string | null }
) {
  return template
    .replaceAll("{{name}}", c.name ?? "")
    .replaceAll("{{companyName}}", c.companyName ?? "")
    .replaceAll("{{email}}", c.email ?? "")
    .replaceAll("{{phone}}", c.phone ?? "");
}

export function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "send failed";
  }
}

/**
 * キャンペーンの PENDING 宛先に一括送信し、結果を DB に保存する。
 * compose/page.tsx の setImmediate と scheduler.ts の両方から呼ばれる。
 */
export async function processCampaign(campaignId: string): Promise<void> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    select: {
      subjectSnapshot: true,
      textBodySnapshot: true,
      htmlBodySnapshot: true,
    },
  });
  if (!campaign) return;

  // 添付ファイルを読み込む
  const uploadsDir = path.join(process.cwd(), "uploads", "campaigns", campaignId);
  const attachments: Attachment[] = [];
  try {
    const files = await fs.readdir(uploadsDir);
    for (const filename of files) {
      const content = await fs.readFile(path.join(uploadsDir, filename));
      attachments.push({ filename, content });
    }
  } catch {
    // ディレクトリなし = 添付なし（正常）
  }

  // PENDING 宛先を取得
  const pending = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId, status: RecipientStatus.PENDING },
    select: {
      id: true,
      emailSnapshot: true,
      contactNameSnapshot: true,
      contactId: true,
    },
  });

  // 差し込み用に Contact を取得
  const contactIds = pending.map((r) => r.contactId).filter(Boolean) as string[];
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, companyName: true, email: true, phone: true },
  });
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  // 集計用の全レコード
  const allRecipients = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId },
    select: { status: true },
  });
  const totalCount = allRecipients.length;
  const skippedCount = allRecipients.filter((r) => r.status === RecipientStatus.SKIPPED).length;

  let sentCount = 0;
  let failedCount = 0;

  for (const r of pending) {
    const email = r.emailSnapshot!;
    const c = r.contactId ? contactMap.get(r.contactId) : undefined;

    const subjRendered = c ? applyVars(campaign.subjectSnapshot, c) : campaign.subjectSnapshot;
    const textRendered = c ? applyVars(campaign.textBodySnapshot, c) : campaign.textBodySnapshot;
    const htmlRendered = campaign.htmlBodySnapshot
      ? c
        ? applyVars(campaign.htmlBodySnapshot, c)
        : campaign.htmlBodySnapshot
      : undefined;

    try {
      const info = await sendEmail({
        to: email,
        subject: subjRendered,
        text: textRendered,
        html: htmlRendered,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      await prisma.emailCampaignRecipient.update({
        where: { id: r.id },
        data: {
          status: RecipientStatus.SENT,
          providerMessageId: info.messageId,
          errorMessage: null,
        },
      });

      sentCount++;
    } catch (e: unknown) {
      await prisma.emailCampaignRecipient.update({
        where: { id: r.id },
        data: {
          status: RecipientStatus.FAILED,
          errorMessage: toErrorMessage(e),
        },
      });
      failedCount++;
    }
  }

  const finalStatus = failedCount > 0 ? CampaignStatus.FAILED : CampaignStatus.SENT;

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: finalStatus,
      totalCount,
      sentCount,
      failedCount,
      skippedCount,
    },
  });
}
