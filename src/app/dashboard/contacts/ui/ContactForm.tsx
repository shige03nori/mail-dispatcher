"use client";

import { useState } from "react";

type Initial = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  note: string;
};

export default function ContactForm({
  mode,
  canEdit = true,
  initial,
}: {
  mode: "create" | "update";
  canEdit?: boolean;
  initial?: Initial;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [companyName, setCompanyName] = useState(initial?.companyName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [msg, setMsg] = useState("");

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setMsg("保存中...");

    const payload = { name, companyName, email, phone, note };

    const res =
      mode === "create"
        ? await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/contacts/${initial!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.ok) {
      setMsg("保存しました");
      if (mode === "create") {
        // 一覧に戻す
        window.location.href = "/dashboard/contacts";
      }
    } else {
      setMsg(`失敗: ${data?.error ?? res.status}`);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <label style={{ fontWeight: 600 }}>氏名（必須）</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required disabled={!canEdit} style={{ padding: 10 }} />

      <label style={{ fontWeight: 600 }}>会社名</label>
      <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!canEdit} style={{ padding: 10 }} />

      <label style={{ fontWeight: 600 }}>メール</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!canEdit} style={{ padding: 10 }} />

      <label style={{ fontWeight: 600 }}>電話</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!canEdit} style={{ padding: 10 }} />

      <label style={{ fontWeight: 600 }}>メモ</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={!canEdit} style={{ padding: 10, minHeight: 120 }} />

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {canEdit ? (
          <button type="submit" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
            {mode === "create" ? "作成" : "更新"}
          </button>
        ) : (
          <span style={{ color: "#888" }}>閲覧のみ（VIEWER）</span>
        )}
        <a href="/dashboard/contacts" style={{ padding: "8px 12px" }}>
          一覧へ戻る
        </a>
      </div>

      {msg && <div style={{ padding: 10, border: "1px solid #eee" }}>{msg}</div>}
    </form>
  );
}
