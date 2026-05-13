// TODO: ユーザー管理ページを実装する
//
// 仕様:
// - getSession() でセッションを確認し、未ログインなら /login、ADMIN 以外なら /dashboard へリダイレクト
// - 同じ組織のメンバー一覧を表形式で表示する（名前・メール・ロール・パスワード設定状態）
// - 各行に SetPasswordForm（パスワード設定フォーム）を配置する
//
// ヒント:
// - prisma.membership.findMany({ where: { organizationId }, include: { user: true } }) でメンバー取得
// - user.passwordHash があれば「設定済み」、なければ「未設定」を表示する

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { tableStyle } from "@/lib/ui/tableStyle";
import SetPasswordForm from "./SetPasswordForm";

export default async function UsersPage() {
  // TODO: セッション確認・メンバー一覧取得・ページ表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: ユーザー管理ページを実装してください</h1>
    </main>
  );
}
