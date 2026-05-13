// TODO: テンプレート編集ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login へリダイレクト
// - prisma.emailTemplate.findFirst で organizationId スコープを使ってテンプレートを取得
//   → 見つからなければ /dashboard/templates へリダイレクト
// - canEdit（VIEWER でないか）に応じて編集フォームまたは閲覧のみ表示を切り替える
// - Server Action（updateTemplateAction.bind(null, template.id)）で保存する
// - searchParams の ok / err でトースト風のメッセージを表示する
//
// ヒント:
// - params と searchParams の両方が Promise 型なので await が必要

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { updateTemplateAction } from "../../actions";

export default async function TemplateEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  // TODO: セッション確認・テンプレート取得・ページ表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: テンプレート編集ページを実装してください</h1>
    </main>
  );
}
