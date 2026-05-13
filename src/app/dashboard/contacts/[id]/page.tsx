// TODO: 連絡先詳細・編集ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login へリダイレクト
// - URLパラメーターの id で prisma.contact.findFirst し、見つからなければ /dashboard/contacts へリダイレクト
//   ※必ず organizationId でスコープを絞ること（URL改ざん対策）
// - ContactForm を mode="update" + initial=（既存データ） + canEdit=（VIEWERでないか）で表示する
//
// ヒント:
// - params は Promise<{ id: string }> なので const { id } = await params; で取得
// - contact.groups は JSON 文字列（例: '["uuid1","uuid2"]'）なので JSON.parse() でパースする

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ContactForm from "../ui/ContactForm";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  // TODO: セッション確認・連絡先取得・ページ表示を実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: 連絡先詳細/編集ページを実装してください</h1>
    </main>
  );
}
