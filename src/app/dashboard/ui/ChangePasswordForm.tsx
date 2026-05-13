"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";

// TODO: パスワード変更フォームコンポーネントを実装する
//
// 仕様:
// - 「パスワードを変更」ボタンをクリックするとフォームが展開する
// - hasPassword が false（未設定）の場合はボタンラベルを「パスワードを設定」にする
// - hasPassword が true の場合のみ「現在のパスワード」入力欄を表示する
// - 新しいパスワードと確認欄が一致しない場合はエラーメッセージを表示する
// - PATCH /api/auth/password を呼んで { currentPassword, newPassword } を送る
//   → ok: true なら成功メッセージを表示してフォームを閉じる
//   → ok: false なら error メッセージを表示する
//
// ヒント:
// - useState でフォームの展開状態・各入力値・エラーメッセージを管理する
// - loading 中はボタンを disabled にする
// - 新しいパスワードの minLength は 8 文字

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);

  // TODO: パスワード変更フォームの実装
  return (
    <div style={{ marginTop: 16 }}>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        {hasPassword ? "パスワードを変更" : "パスワードを設定"}
      </button>

      {open && (
        <div style={{ marginTop: 12, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <p>TODO: パスワード変更フォームを実装してください</p>
          <button type="button" onClick={() => setOpen(false)}>キャンセル</button>
        </div>
      )}
    </div>
  );
}
