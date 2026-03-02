"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formStyle } from "@/lib/ui/formStyle";

type Group = { id: string; name: string };

type Initial = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  note: string;
  groupIds: string[];
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
  const [groupIds, setGroupIds] = useState<string[]>(initial?.groupIds ?? []);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupMsg, setGroupMsg] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setGroups(d.groups); })
      .catch(() => {});
  }, []);

  function toggleGroup(id: string) {
    if (!canEdit) return;
    setGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function createGroup() {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    setGroupMsg("作成中...");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.ok) {
      setGroups((prev) => [...prev, data.group]);
      setGroupIds((prev) => [...prev, data.group.id]);
      setNewGroupName("");
      setGroupMsg("");
    } else {
      setGroupMsg(
        data?.error === "name_already_exists"
          ? "同名のグループが既に存在します"
          : `失敗: ${data?.error ?? res.status}`
      );
    }
  }

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    setMsg("保存中...");

    const payload = { name, companyName, email, phone, note, groupIds };

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
        window.location.href = "/dashboard/contacts";
      }
    } else {
      setMsg(`失敗: ${data?.error ?? res.status}`);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <label style={{ fontWeight: 600 }}>氏名（必須）</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required disabled={!canEdit} style={{ ...formStyle.input }} />

      <label style={{ fontWeight: 600 }}>会社名</label>
      <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!canEdit} style={{ ...formStyle.input }} />

      <label style={{ fontWeight: 600 }}>メール</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!canEdit} style={{ ...formStyle.input }} />

      <label style={{ fontWeight: 600 }}>電話</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!canEdit} style={{ ...formStyle.input }} />

      <label style={{ fontWeight: 600 }}>メモ</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={!canEdit} style={{ ...formStyle.textarea }} />

      <label style={{ fontWeight: 600 }}>グループ</label>

      {/* グループ選択リスト */}
      <div style={{ border: "1px solid #fff", borderRadius: 10, overflow: "hidden" }}>
        {groups.length === 0 ? (
          <div style={{ padding: "10px 14px", color: "#888", fontSize: 13 }}>
            グループがありません。下のフォームから追加してください。
          </div>
        ) : (
          groups.map((g, i) => {
            const selected = groupIds.includes(g.id);
            return (
              <div
                key={g.id}
                onClick={() => toggleGroup(g.id)}
                style={{
                  padding: "10px 14px",
                  cursor: canEdit ? "pointer" : "default",
                  background: selected ? "#1d4ed8" : "transparent",
                  color: selected ? "#fff" : "#ccc",
                  borderBottom: i < groups.length - 1 ? "1px solid #222" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  userSelect: "none",
                }}
              >
                <span style={{ fontSize: 12, width: 16, textAlign: "center" }}>
                  {selected ? "✓" : ""}
                </span>
                {g.name}
              </div>
            );
          })
        )}
      </div>

      {/* インライングループ作成（編集可能時のみ） */}
      {canEdit && (
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="新しいグループ名を追加"
              style={{ ...formStyle.input, flex: 1 }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createGroup(); } }}
            />
            <button type="button" onClick={createGroup} className="btn-custom01">
              追加
            </button>
          </div>
          {groupMsg && (
            <div style={{ marginTop: 4, fontSize: 13, color: "#f87171" }}>{groupMsg}</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
        {canEdit ? (
          <button type="submit" className="btn-custom01 btn-custom01-primary">
            {mode === "create" ? "作成" : "更新"}
          </button>
        ) : (
          <span style={{ color: "#888" }}>閲覧のみ（VIEWER）</span>
        )}
        <Link href="/dashboard/contacts" className="btn-custom01">
          一覧へ戻る
        </Link>
      </div>

      {msg && <div style={{ padding: 10, border: "1px solid #eee" }}>{msg}</div>}
    </form>
  );
}
