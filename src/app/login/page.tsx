"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("shige03nori@gmail.com");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>ログイン</h1>
      <p style={{ marginTop: 8 }}>
        メールアドレスにログインリンクを送ります（開発中はコンソールに表示）。
      </p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontWeight: 600 }}>メールアドレス</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="you@example.com"
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 12, padding: 10, width: "100%" }}
        >
          {loading ? "送信中..." : "Magic Linkを送る"}
        </button>
      </form>

      {sent && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
          送信しました。ターミナル（コンソール）に表示されたURLを開いてください。
        </div>
      )}
    </main>
  );
}
