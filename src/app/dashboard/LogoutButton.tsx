"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // サーバー側で /login にリダイレクトするけど、
    // fetch だと画面遷移しないので明示的に遷移
    window.location.href = "/login";
  }

  return (
    <button
      onClick={logout}
      className="btn btn-danger"
    >
      ログアウト
    </button>
  );
}
