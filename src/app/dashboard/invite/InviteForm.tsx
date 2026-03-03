"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";
import { invitationSchema } from "@/lib/schemas/invitation";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [status, setStatus] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setEmailError("");

    const parsed = invitationSchema.safeParse({ email, role });
    if (!parsed.success) {
      const emailIssue = parsed.error.issues.find((i) => i.path[0] === "email");
      if (emailIssue) setEmailError(emailIssue.message);
      return;
    }

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
        style={{ ...formStyle.input, ...(emailError ? { borderColor: "#f87171" } : {}) }}
      />
      {emailError && <div style={{ fontSize: 12, color: "#f87171", marginTop: -6 }}>{emailError}</div>}

      <label style={{ fontWeight: 600 }}>権限</label>
      <select value={role} onChange={(e) => setRole(e.target.value as "VIEWER" | "EDITOR")} style={formStyle.select}>
        <option value="VIEWER">VIEWER（閲覧のみ）</option>
        <option value="EDITOR">EDITOR（編集可）</option>
      </select>

      <button type="submit" className="btn-custom01 btn-custom01-primary">
        招待リンクを発行
      </button>

      {status && <div style={{ padding: 10, border: "1px solid #eee" }}>{status}</div>}
    </form>
  );
}
