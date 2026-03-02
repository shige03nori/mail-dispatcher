"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";

type Mode = "password" | "magic";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");

  // password mode state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // magic link mode state
  const [magicEmail, setMagicEmail] = useState("shige03nori@gmail.com");
  const [sent, setSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        window.location.href = "/dashboard";
      } else {
        setPwError(data.error ?? "ログインに失敗しました");
      }
    } finally {
      setPwLoading(false);
    }
  }

  async function submitMagic(e: React.FormEvent) {
    e.preventDefault();
    setMagicLoading(true);
    try {
      await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail }),
      });
      setSent(true);
    } finally {
      setMagicLoading(false);
    }
  }

  const containerStyle = {
    maxWidth: 480,
    margin: "60px auto",
    padding: 24,
    border: "1px solid #333",
    borderRadius: 12,
    background: "#111",
    color: "#fff",
  };

  return (
    <main style={{ background: "#000", minHeight: "100vh" }}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>ログイン</h1>

        {/* モード切り替えタブ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={mode === "password" ? "btn-custom01 btn-custom01-primary" : "btn-custom01 btn-custom01-navy"}
            style={{ flex: 1 }}
          >
            パスワード
          </button>
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={mode === "magic" ? "btn-custom01 btn-custom01-primary" : "btn-custom01 btn-custom01-navy"}
            style={{ flex: 1 }}
          >
            Magic Link
          </button>
        </div>

        {mode === "password" && (
          <form onSubmit={submitPassword} style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={formStyle.input}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                required
                style={formStyle.input}
              />
            </div>
            {pwError && (
              <div style={{ fontSize: 13, color: "#f87171", padding: "8px 0" }}>{pwError}</div>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="btn-custom01 btn-custom01-primary"
              style={{ width: "100%" }}
            >
              {pwLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        )}

        {mode === "magic" && (
          <form onSubmit={submitMagic} style={{ display: "grid", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
              メールアドレスにログインリンクを送ります（開発中はコンソールに表示）。
            </p>
            <div>
              <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
                メールアドレス
              </label>
              <input
                type="email"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={formStyle.input}
              />
            </div>
            <button
              type="submit"
              disabled={magicLoading || sent}
              className="btn-custom01 btn-custom01-primary"
              style={{ width: "100%" }}
            >
              {magicLoading ? "送信中..." : "Magic Linkを送る"}
            </button>
            {sent && (
              <div style={{ fontSize: 13, color: "#6ee7b7", padding: "8px 0" }}>
                送信しました。ターミナル（コンソール）に表示されたURLを開いてください。
              </div>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
