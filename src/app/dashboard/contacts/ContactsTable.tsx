"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Contact = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  note: string | null;
  createdAt: string | Date;
};

export default function ContactsTable({
  initialContacts,
  canEdit,
}: {
  initialContacts: Contact[];
  canEdit: boolean;
}) {
  const [q, setQ] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [msg, setMsg] = useState<string>("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) => {
      const hay = [
        c.name,
        c.companyName ?? "",
        c.email ?? "",
        c.phone ?? "",
        c.note ?? "",
      ].join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [q, contacts]);

  async function del(id: string) {
    if (!confirm("削除しますか？")) return;
    setMsg("削除中...");
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setMsg("削除しました");
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(`削除失敗: ${data?.error ?? "unknown"}`);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="検索（氏名/会社/メール/電話/メモ）"
          style={{ flex: 1, padding: 10 }}
        />
        <button
          onClick={async () => {
            setMsg("更新中...");
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (data?.ok) {
              setContacts(data.contacts);
              setMsg("更新しました");
            } else {
              setMsg("更新失敗");
            }
          }}
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
        >
          再読み込み
        </button>
      </div>

      {msg && <div style={{ marginTop: 10, padding: 10, border: "1px solid #eee" }}>{msg}</div>}

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["氏名", "会社", "メール", "電話", "操作"].map((h) => (
              <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{c.name}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{c.companyName ?? ""}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{c.email ?? ""}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{c.phone ?? ""}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/dashboard/contacts/${c.id}`}
                    style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8 }}
                  >
                    詳細/編集
                  </Link>
                  {canEdit ? (
                    <button
                      onClick={() => del(c.id)}
                      style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8 }}
                    >
                      削除
                    </button>
                  ) : (
                    <span style={{ color: "#888" }}>閲覧のみ</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 12, color: "#666" }}>
                該当なし
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
