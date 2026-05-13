// TODO: メール送信結果ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login へリダイレクト
// - searchParams.campaignId でキャンペーンを取得（organizationId スコープ必須）
// - キャンペーンの status が SENDING の間は自動リロード（<meta http-equiv="refresh" content="3">）
// - status が SCHEDULED の間は1分ごとに自動リロード
// - 送信結果サマリー（合計・送信・失敗・スキップ件数）を表示する
// - 宛先明細テーブル（メール・名前・ステータス・エラーメッセージ）を表示する
//
// ヒント:
// - prisma.emailCampaignRecipient.findMany で明細を取得（最大300件）
// - ステータスバッジ（SENT:緑、FAILED:赤、SKIPPED:黄、PENDING:青）で視覚的に区別する

import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";

export default async function ComposeResultPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  // TODO: セッション確認・キャンペーン取得・結果表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: 送信結果ページを実装してください</h1>
    </main>
  );
}
