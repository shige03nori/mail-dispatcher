"use client";

// TODO: ログインページを実装する
//
// 仕様:
// - 「パスワードログイン」と「Magic Link」の2つのタブで切り替えられる
// - パスワードログイン: メールアドレスとパスワードを入力して POST /api/auth/login
//   → ok: true なら /dashboard へ遷移
//   → ok: false ならエラーメッセージを表示
// - Magic Link: メールアドレスを入力して POST /api/auth/request-link
//   → 送信後「ターミナルのURLを確認してください」と表示
//
// ヒント:
// - "use client" + useState でフォームの状態を管理する
// - fetch() で API を呼び出し、res.json() でレスポンスを取得する
// - ログイン成功後は window.location.href = "/dashboard" でリダイレクト
// - loading 状態の間はボタンを disabled にする
//
// 例 (パスワードログイン部分):
// const res = await fetch("/api/auth/login", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ email, password }),
// });
// const data = await res.json();
// if (data.ok) window.location.href = "/dashboard";

export default function LoginPage() {
  return (
    <main>
      <h1>TODO: ログインページを実装してください</h1>
    </main>
  );
}
