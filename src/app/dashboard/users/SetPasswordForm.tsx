"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";

// TODO: 管理者用パスワード設定フォームコンポーネントを実装する
//
// 仕様:
// - 「新しいパスワード（8文字以上）」と「確認」の2つの入力欄
// - 送信時に PATCH /api/admin/users/{userId}/password へ { password } を送る
// - パスワードと確認が一致しない場合はエラーメッセージを表示する
// - 成功/失敗のメッセージを表示する
//
// ヒント:
// - PATCH /api/admin/users/${userId}/password に fetch する
// - 成功後は入力欄をリセットする

export default function SetPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // TODO: フォームのsubmit処理を実装する
  return (
    <form onSubmit={(e) => { e.preventDefault(); alert("TODO: SetPasswordForm を実装してください"); }}>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="新しいパスワード（8文字以上）" required minLength={8} />
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="確認" required minLength={8} />
      <button type="submit">設定</button>
      {status && <span style={{ color: status.ok ? "green" : "red" }}>{status.msg}</span>}
    </form>
  );
}
