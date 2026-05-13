"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";
import { invitationSchema } from "@/lib/schemas/invitation";

// TODO: ユーザー招待フォームコンポーネントを実装する
//
// 仕様:
// - メールアドレス入力欄と権限選択（VIEWER / EDITOR）を持つフォーム
// - 送信前に invitationSchema（Zod）でクライアントサイドバリデーションを行う
//   → メール形式エラーがあれば入力欄の下にエラーメッセージを表示する
// - POST /api/invitations/create へ { email, role } を送信する
// - 成功したら「ターミナルを確認してください」と表示してメール欄をリセット
//
// ヒント:
// - invitationSchema.safeParse({ email, role }) でバリデーション
// - parsed.error.issues.find(i => i.path[0] === "email") でメールエラーを取り出す
// - ADMIN は招待できず VIEWER / EDITOR のみ招待可能（ロールの選択肢を限定）

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [status, setStatus] = useState("");
  const [emailError, setEmailError] = useState("");

  // TODO: フォームのsubmit処理を実装する
  return (
    <form onSubmit={(e) => { e.preventDefault(); alert("TODO: InviteForm を実装してください"); }} style={{ display: "grid", gap: 10 }}>
      <label>招待するメールアドレス</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="user@example.com" />
      {emailError && <div style={{ color: "red" }}>{emailError}</div>}
      <label>権限</label>
      <select value={role} onChange={(e) => setRole(e.target.value as "VIEWER" | "EDITOR")}>
        <option value="VIEWER">VIEWER（閲覧のみ）</option>
        <option value="EDITOR">EDITOR（編集可）</option>
      </select>
      <button type="submit">招待リンクを発行</button>
      {status && <div>{status}</div>}
    </form>
  );
}
