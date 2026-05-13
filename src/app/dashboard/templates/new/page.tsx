// TODO: テンプレート新規作成ページを実装する
//
// 仕様:
// - getSession() でセッション確認し、未ログインなら /login、VIEWER なら /dashboard/templates へリダイレクト
// - 入力項目: テンプレ名・件名・本文（text）・HTML本文（任意）
// - Server Action（actions.ts の createTemplateAction）を form の action に指定して送信する
//
// ヒント:
// - <form action={createTemplateAction}> で Server Action を使う（API Route は不要）
// - 本文に {{name}} / {{companyName}} / {{email}} / {{phone}} が差し込みプレースホルダーになると説明を添える

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createTemplateAction } from "../actions";
import { formStyle } from "@/lib/ui/formStyle";

export default async function TemplateNewPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  // TODO: セッション確認と権限チェックを実装する
  return (
    <main style={{ padding: "72px 16px 16px 16px" }}>
      <h1>TODO: テンプレート作成ページを実装してください</h1>
      <form action={createTemplateAction} style={{ display: "grid", gap: 10, maxWidth: 800 }}>
        <label>テンプレ名</label>
        <input name="name" style={formStyle.input} />
        <label>件名</label>
        <input name="subject" style={formStyle.input} />
        <label>本文（text）</label>
        <textarea name="textBody" rows={10} style={formStyle.textarea} />
        <button type="submit">作成</button>
      </form>
    </main>
  );
}
