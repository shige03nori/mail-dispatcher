// TODO: キャンペーン履歴ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login へリダイレクト
// - キャンペーン一覧を新しい順で表示する（件名・ステータス・送信数・失敗数・日時）
// - ステータスのフィルタ（DRAFT/SENDING/SENT/FAILED/SCHEDULED）と検索キーワードで絞り込む
// - 各キャンペーン名はリンクにして /dashboard/campaigns/{id} の詳細ページへ誘導する
// - ページネーション（50件/ページ）
//
// ヒント:
// - searchParams で q（検索）・status（フィルタ）・page（ページ番号）を受け取る
// - prisma.emailCampaign.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } })
// - ステータスに応じてバッジの色を変えると見やすい（例: SENT→緑、FAILED→赤）
// - failedCount > 0 の行は赤字にする

import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";
import { formStyle } from "@/lib/ui/formStyle";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  // TODO: セッション確認・キャンペーン取得・ページ表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: キャンペーン履歴ページを実装してください</h1>
    </main>
  );
}
