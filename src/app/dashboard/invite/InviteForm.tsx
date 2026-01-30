"use client";

import { useState } from "react";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [status, setStatus] = useState<string>("");

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setStatus("送信中...");

    const res = await fetch("/api/invitations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    if (res.ok) {
      setStatus("招待リンクを発行しました。ターミナル（コンソール）を確認してください。");
      setEmail("");
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(`失敗: ${data?.error ?? "unknown"}`);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <label style={{ fontWeight: 600 }}>招待するメールアドレス</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="user@example.com"
        required
        style={{ padding: 10 }}
      />

      <label style={{ fontWeight: 600 }}>権限</label>
      <select value={role} onChange={(e) => setRole(e.target.value as "VIEWER" | "EDITOR")} style={{ padding: 10 }}>
        <option value="VIEWER">VIEWER（閲覧のみ）</option>
        <option value="EDITOR">EDITOR（編集可）</option>
      </select>

      <button type="submit" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
        招待リンクを発行
      </button>

      {status && <div style={{ padding: 10, border: "1px solid #eee" }}>{status}</div>}
    </form>
  );
}
