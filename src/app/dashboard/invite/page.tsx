// TODO: ユーザー招待ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login、ADMIN 以外なら /dashboard へリダイレクト
// - ページ上部に説明文を表示し、InviteForm コンポーネントをレンダリングする

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import InviteForm from "./InviteForm";

export default async function InvitePage() {
  // TODO: セッション確認と権限チェックを実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: ユーザー招待ページを実装してください</h1>
      <InviteForm />
    </main>
  );
}
