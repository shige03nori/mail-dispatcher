import path from "path";
import fs from "fs/promises";
import { CampaignStatus, RecipientStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { Attachment } from "@/lib/email/types";

// TODO: テンプレート文字列に連絡先データを差し込む関数を実装する
// ヒント: {{name}} {{companyName}} {{email}} {{phone}} の4種類を replaceAll() で置き換える
// ヒント: null の場合は空文字 "" に置き換える
export function applyVars(
  template: string,
  c: { name: string; companyName: string | null; email: string | null; phone: string | null }
): string {
  throw new Error("TODO: applyVars を実装してください");
}

// TODO: エラーを文字列に変換するユーティリティ関数を実装する
// ヒント: Error インスタンスなら e.message、string ならそのまま、それ以外は JSON.stringify
export function toErrorMessage(e: unknown): string {
  throw new Error("TODO: toErrorMessage を実装してください");
}

/**
 * TODO: キャンペーンの PENDING 宛先に一括送信して結果を DB に保存する関数を実装する
 *
 * 処理の流れ:
 * 1. campaignId でキャンペーン（件名・本文スナップショット）を取得する
 * 2. uploads/campaigns/{campaignId}/ フォルダから添付ファイルを読み込む（フォルダがなければスキップ）
 * 3. status が PENDING の宛先を取得する
 * 4. 各宛先に applyVars() でプレースホルダーを差し込んだ件名・本文でメール送信する
 * 5. 成功した宛先は RecipientStatus.SENT、失敗した宛先は RecipientStatus.FAILED に更新する
 * 6. 全宛先の送信が終わったら、キャンペーンの status を SENT または FAILED に更新する
 *    - failedCount > 0 なら CampaignStatus.FAILED
 *    - そうでなければ CampaignStatus.SENT
 *
 * ヒント:
 * - path.join(process.cwd(), "uploads", "campaigns", campaignId) で添付フォルダのパスを作る
 * - fs.readdir() / fs.readFile() で添付ファイルを読み込む（try/catch でエラーを無視）
 * - prisma.emailCampaignRecipient.findMany で PENDING の宛先を取得
 * - prisma.emailCampaignRecipient.update でステータスと providerMessageId / errorMessage を更新
 * - prisma.emailCampaign.update で totalCount / sentCount / failedCount / skippedCount を更新
 */
export async function processCampaign(campaignId: string): Promise<void> {
  throw new Error("TODO: processCampaign を実装してください");
}
