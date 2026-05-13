// TODO: キャンペーン詳細ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login へリダイレクト
// - params.id で prisma.emailCampaign.findFirst（organizationId スコープ必須）
//   → 見つからなければ /dashboard/campaigns へリダイレクト
// - キャンペーン情報（件名・ステータス・送信数・失敗数・予約日時など）を表示する
// - prisma.emailCampaignRecipient で送信明細テーブルを表示する（最大300件）
// - canEdit のユーザーには「再送信」ボタンを表示する
//   → /dashboard/compose?ids={contactIds}&from={campaignId} へ遷移
//
// ヒント:
// - params は Promise<{ id: string }> なので const { id } = await params; で取得

import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // TODO: セッション確認・キャンペーン取得・ページ表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: キャンペーン詳細ページを実装してください</h1>
    </main>
  );
}
