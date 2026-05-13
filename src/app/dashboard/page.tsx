// TODO: ダッシュボードトップページを実装する
//
// 仕様:
// - getSession() でセッションを取得し、未ログインなら /login にリダイレクト
// - ログイン中ユーザーの情報（メールアドレス・ロール）と組織名を表示する
// - 各機能へのリンクボタンを並べる
//   - 連絡先一覧・連絡先追加・テンプレ一覧・配信履歴（全ロール共通）
//   - ユーザー招待（ADMIN / EDITOR のみ）・テンプレ作成（ADMIN / EDITOR のみ）
//   - ユーザー管理（ADMIN のみ）
//
// ヒント:
// - redirect("/login") は next/navigation からインポートする
// - prisma.user.findUnique / prisma.organization.findUnique でデータ取得
// - session.role === "VIEWER" のユーザーには作成・招待リンクを表示しない

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChangePasswordForm } from "@/app/dashboard/ui/ChangePasswordForm";

export default async function DashboardPage() {
  // TODO: セッション確認・ユーザー情報取得・ページ表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: ダッシュボードを実装してください</h1>
    </main>
  );
}
