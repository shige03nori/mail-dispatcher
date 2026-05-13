// TODO: メール作成・送信ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、VIEWER なら /dashboard/contacts へリダイレクト
// - searchParams.ids（カンマ区切りのcontactId）を受け取り、0件なら /dashboard/contacts へリダイレクト
// - テンプレート選択（GET でこのページを再読み込みして件名・本文をプレビューに反映）
// - 件名・本文（text）・HTML本文（任意）・添付ファイル（AttachmentPicker）の入力フォーム
// - 予約送信日時の入力（空なら即時送信、指定があれば予約）
// - 「送信」ボタンで Server Action を呼ぶ（"use server"関数をファイル内に定義する）
//
// Server Action の処理:
// 1. prisma.emailCampaign.create() でキャンペーンを作成（status: SENDING or SCHEDULED）
// 2. prisma.emailCampaignRecipient.createMany() で宛先明細を作成
//    - メールがない連絡先は status: SKIPPED にする
// 3. 添付ファイルを uploads/campaigns/{campaignId}/ に保存する
// 4. 即時送信なら setImmediate(() => processCampaign(campaignId)) でバックグラウンド実行
// 5. /dashboard/compose/result?campaignId={id} へリダイレクト
//
// ヒント:
// - URLパラメーターの ids は「,」区切りの文字列（最大500件）
// - テンプレート選択は <select name="templateId"> + <form method="GET"> で実装（再読み込みでプレビュー反映）
// - Server Action は "use server" を関数内に書くか、先頭の "use server" ディレクティブでファイル全体に適用

import path from "path";
import fs from "fs/promises";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { processCampaign } from "@/lib/email/processCampaign";
import { tableStyle } from "@/lib/ui/tableStyle";
import { formStyle } from "@/lib/ui/formStyle";
import { AttachmentPicker } from "./AttachmentPicker";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; templateId?: string; from?: string }>;
}) {
  // TODO: メール作成ページの実装
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: メール作成ページを実装してください</h1>
      <AttachmentPicker />
    </main>
  );
}
