"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";

type Group = { id: string; name: string };

export default function GroupManager({
  initialGroups,
  onGroupsChange,
}: {
  initialGroups: Group[];
  onGroupsChange?: (groups: Group[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");

  function updateGroups(next: Group[]) {
    setGroups(next);
    onGroupsChange?.(next);
  }

  async function addGroup(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setMsg("作成中...");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.ok) {
      updateGroups([...groups, data.group]);
      setNewName("");
      setMsg("");
    } else {
      setMsg(data?.error === "name_already_exists" ? "同名のグループが既に存在します" : `失敗: ${data?.error ?? res.status}`);
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm("グループを削除しますか？")) return;
    setMsg("削除中...");

    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      updateGroups(groups.filter((g) => g.id !== id));
      setMsg("");
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(`削除失敗: ${data?.error ?? res.status}`);
    }
  }

  return (
    <div style={{ marginBottom: 16, border: "1px solid #333", borderRadius: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "transparent",
          border: "none",
          color: "#fff",
          textAlign: "left",
          cursor: "pointer",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>{open ? "▼" : "▶"}</span>
        グループ管理
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {groups.length === 0 && (
              <span style={{ color: "#888", fontSize: 13 }}>グループなし</span>
            )}
            {groups.map((g) => (
              <span
                key={g.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  background: "#1d4ed8",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 13,
                }}
              >
                {g.name}
                <button
                  type="button"
                  onClick={() => deleteGroup(g.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    padding: "0 2px",
                    lineHeight: 1,
                    fontSize: 14,
                  }}
                  title="削除"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={addGroup} style={{ display: "flex", gap: 8 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="新しいグループ名"
              style={{ ...formStyle.input, flex: 1 }}
            />
            <button type="submit" className="btn-custom01 btn-custom01-primary">
              追加
            </button>
          </form>

          {msg && <div style={{ marginTop: 8, fontSize: 13, color: "#f87171" }}>{msg}</div>}
        </div>
      )}
    </div>
  );
}
