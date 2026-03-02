"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";

export default function SetPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ ok: false, msg: "パスワードが一致しません" });
      return;
    }
    setStatus(null);

    const res = await fetch(`/api/admin/users/${userId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      setStatus({ ok: true, msg: "パスワードを設定しました" });
      setPassword("");
      setConfirm("");
    } else {
      setStatus({ ok: false, msg: data.error ?? "エラーが発生しました" });
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap" }}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="新しいパスワード（8文字以上）"
        required
        minLength={8}
        style={{ ...formStyle.input, width: 200, fontSize: 13 }}
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="確認"
        required
        minLength={8}
        style={{ ...formStyle.input, width: 120, fontSize: 13 }}
      />
      <button
        type="submit"
        className="btn-custom01 btn-custom01-primary"
      >
        設定
      </button>
      {status && (
        <span style={{ fontSize: 12, color: status.ok ? "#16a34a" : "#dc2626", alignSelf: "center" }}>
          {status.msg}
        </span>
      )}
    </form>
  );
}
