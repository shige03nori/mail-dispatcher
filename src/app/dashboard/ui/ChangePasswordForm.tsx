"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMsg({ text: "新しいパスワードが一致しません", ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      setMsg({ text: "パスワードを変更しました", ok: true });
      setCurrent("");
      setNext("");
      setConfirm("");
      setOpen(false);
    } else {
      setMsg({ text: data.error ?? "変更に失敗しました", ok: false });
    }
    setLoading(false);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setMsg(null); }}
        className="btn-custom01 btn-custom01-secondary"
      >
        {hasPassword ? "パスワードを変更" : "パスワードを設定"}
      </button>

      {open && (
        <form
          onSubmit={submit}
          style={{
            marginTop: 12,
            padding: "16px",
            border: "1px solid #333",
            borderRadius: 10,
            display: "grid",
            gap: 10,
            maxWidth: 400,
          }}
        >
          {hasPassword && (
            <div>
              <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
                現在のパスワード
              </label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                style={formStyle.input}
              />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
              新しいパスワード（8文字以上）
            </label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              style={formStyle.input}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#ccc" }}>
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={formStyle.input}
            />
          </div>

          {msg && (
            <div style={{ fontSize: 13, color: msg.ok ? "#6ee7b7" : "#f87171" }}>
              {msg.text}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading} className="btn-custom01 btn-custom01-primary">
              {loading ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-custom01 btn-custom01-secondary"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
