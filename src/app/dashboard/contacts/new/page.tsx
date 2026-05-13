// TODO: 連絡先新規作成ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login、VIEWER なら /dashboard/contacts へリダイレクト
// - ContactForm コンポーネントを mode="create" で表示する

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import ContactForm from "../ui/ContactForm";

export default async function NewContactPage() {
  // TODO: セッション確認と権限チェックを実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: 連絡先新規作成ページを実装してください</h1>
      <ContactForm mode="create" />
    </main>
  );
}
