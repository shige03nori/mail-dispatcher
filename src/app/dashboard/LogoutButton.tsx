"use client";

// TODO: ログアウトボタンコンポーネントを実装する
//
// 仕様:
// - ボタンをクリックしたら POST /api/auth/logout を呼ぶ
// - 完了後 window.location.href = "/login" でログインページへ遷移する
//
// ヒント:
// - "use client" コンポーネントで実装する
// - fetch("/api/auth/logout", { method: "POST" }) でログアウトAPIを呼ぶ
// - await してからリダイレクトする（fetch は非同期なので注意）

export function LogoutButton() {
  return (
    <button onClick={() => alert("TODO: ログアウトを実装してください")}>
      ログアウト
    </button>
  );
}
