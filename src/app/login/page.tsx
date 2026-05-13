"use client";

import { useState } from "react";

type Mode = "password" | "magic";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState("");

  // パスワードログイン
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Magic Link
  const [magicEmail, setMagicEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  // 開発用バイパスログイン（認証不要）
  async function devLogin() {
    setDevLoading(true);
    setDevError("");
    try {
      const res = await fetch("/api/auth/dev-login", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        window.location.href = "/dashboard";
      } else {
        setDevError(data.error ?? "ログインに失敗しました");
      }
    } finally {
      setDevLoading(false);
    }
  }

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

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 16 }}>

        <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", margin: 0 }}>
          mail-dispatcher
        </h1>

        {/* 開発用ログイン */}
        <section style={{ padding: 20, border: "2px solid #3b82f6", borderRadius: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", margin: "0 0 4px" }}>
            開発用ログイン
          </p>
          <p style={{ fontSize: 12, margin: "0 0 12px" }}>
            メールアドレス・パスワード不要で管理者としてログインします。
          </p>
          <button
            type="button"
            onClick={devLogin}
            disabled={devLoading}
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: devLoading ? "not-allowed" : "pointer",
              opacity: devLoading ? 0.7 : 1,
            }}
          >
            {devLoading ? "ログイン中..." : "ログイン"}
          </button>
          {devError && (
            <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>{devError}</p>
          )}
        </section>

        {/* 区切り */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 12 }}>APIを実装したら下記も使えます</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>

        {/* 通常ログイン */}
        <section style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          {/* タブ切り替え */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(["password", "magic"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  border: "1px solid",
                  borderColor: mode === m ? "#3b82f6" : "#e5e7eb",
                  borderRadius: 8,
                  background: mode === m ? "#eff6ff" : "transparent",
                  color: mode === m ? "#3b82f6" : "#6b7280",
                  fontWeight: mode === m ? 700 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {m === "password" ? "パスワード" : "Magic Link"}
              </button>
            ))}
          </div>

          {mode === "password" && (
            <form onSubmit={submitPassword} style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, boxSizing: "border-box", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, boxSizing: "border-box", fontSize: 14 }}
                />
              </div>
              {pwError && (
                <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{pwError}</p>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                style={{ padding: "10px 0", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: pwLoading ? "not-allowed" : "pointer", opacity: pwLoading ? 0.7 : 1 }}
              >
                {pwLoading ? "ログイン中..." : "ログイン"}
              </button>
            </form>
          )}

          {mode === "magic" && (
            <form onSubmit={submitMagic} style={{ display: "grid", gap: 12 }}>
              <p style={{ fontSize: 13, margin: 0 }}>
                メールアドレスにログインリンクを送ります（開発中はターミナルに表示）。
              </p>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, boxSizing: "border-box", fontSize: 14 }}
                />
              </div>
              <button
                type="submit"
                disabled={magicLoading || sent}
                style={{ padding: "10px 0", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: (magicLoading || sent) ? "not-allowed" : "pointer", opacity: (magicLoading || sent) ? 0.7 : 1 }}
              >
                {magicLoading ? "送信中..." : "Magic Link を送る"}
              </button>
              {sent && (
                <p style={{ fontSize: 13, color: "#16a34a", margin: 0 }}>
                  送信しました。ターミナルに表示されたURLを開いてください。
                </p>
              )}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
