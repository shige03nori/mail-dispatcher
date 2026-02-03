"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formStyle } from "@/lib/ui/formStyle";
import { buttonStyle } from "@/lib/ui/buttonStyle";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [msg, setMsg] = useState<string>("");

  // ★追加: 複数選択状態（contactId -> boolean）
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) => {
      const hay = [c.name, c.companyName ?? "", c.email ?? "", c.phone ?? "", c.note ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [q, contacts]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );
  const selectedCount = selectedIds.length;

  const emailStats = useMemo(() => {
    let hasEmail = 0;
    for (const id of selectedIds) {
      const c = contacts.find((x) => x.id === id);
      if (c?.email) hasEmail++;
    }
    return { hasEmail, noEmail: selectedCount - hasEmail };
  }, [contacts, selectedIds, selectedCount]);

  // 表示中(filtered)に対する「全選択」用
  const allChecked =
    filtered.length > 0 && filtered.every((c) => selected[c.id] === true);
  const someChecked =
    filtered.some((c) => selected[c.id] === true) && !allChecked;

  function toggleAllVisible(next: boolean) {
    // 検索結果(filtered)だけを一括でON/OFF
    setSelected((prev) => {
      const nextSelected = { ...prev };
      for (const c of filtered) nextSelected[c.id] = next;
      return nextSelected;
    });
  }

  function toggleOne(id: string, next: boolean) {
    setSelected((prev) => ({ ...prev, [id]: next }));
  }

  function clearSelection() {
    setSelected({});
  }

  function goCompose() {
    if (selectedCount === 0) return;
    const idsParam = selectedIds.join(",");
    startTransition(() => {
      router.push(`/dashboard/compose?ids=${encodeURIComponent(idsParam)}`);
    });
  }

  async function del(id: string) {
    if (!confirm("削除しますか？")) return;
    setMsg("削除中...");
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      // ★削除されたものが選択されてたら選択解除
      setSelected((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setMsg("削除しました");
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(`削除失敗: ${data?.error ?? "unknown"}`);
    }
  }

  return (
    <div>
      {/* 検索 + 再読み込み */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="検索（氏名/会社/メール/電話/メモ）"
          style={formStyle.input}
        />
        <button
          onClick={async () => {
            setMsg("更新中...");
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (data?.ok) {
              setContacts(data.contacts);
              setMsg("更新しました");
              // ★再読み込み後、選択が残ってるとIDズレはないが、存在しないIDが混じる可能性があるので掃除
              setSelected((prev) => {
                const alive = new Set<string>(data.contacts.map((c: Contact) => c.id));
                const next: Record<string, boolean> = {};
                for (const [k, v] of Object.entries(prev)) {
                  if (v && alive.has(k)) next[k] = true;
                }
                return next;
              });
            } else {
              setMsg("更新失敗");
            }
          }}
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
        >
          再読み込み
        </button>

        {/* Composeボタン（VIEWERは出さない/押せない） */}
        {canEdit && (
          <button
            onClick={goCompose}
            disabled={selectedCount === 0 || isPending}
            style={{ 
                        ...buttonStyle.base,
                        ...buttonStyle.primary
                   }}
            title={selectedCount === 0 ? "送信先を選択してください" : "選択した連絡先へメールを作成"}
          >
            メール作成
          </button>
        )}
      </div>

      {/* ★追加: 選択状況バー */}
      {canEdit && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #eee" }}>
          選択: <b>{selectedCount}</b>件
          {selectedCount > 0 && (
            <span style={{ marginLeft: 8, color: "#666" }}>
              （送信可能: {emailStats.hasEmail} / メールなし: {emailStats.noEmail}）
            </span>
          )}
          {selectedCount > 0 && (
            <button
              onClick={clearSelection}
              style={{
                marginLeft: 12,
                border: "none",
                background: "transparent",
                textDecoration: "underline",
                color: "#666",
                cursor: "pointer",
              }}
            >
              選択解除
            </button>
          )}
        </div>
      )}

      {msg && <div style={{ marginTop: 10, padding: 10, border: "1px solid #eee" }}>{msg}</div>}

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {/* ★追加: チェック列 */}
            <th style={{ width: 44, textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={(e) => toggleAllVisible(e.target.checked)}
                disabled={!canEdit || filtered.length === 0}
                title={!canEdit ? "閲覧のみ" : "表示中の連絡先を全選択"}
              />
            </th>

            {["氏名", "会社", "メール", "電話", "操作"].map((h) => (
              <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filtered.map((c) => {
            const checked = !!selected[c.id];
            const emailMissing = !c.email;

            return (
              <tr key={c.id}>
                {/* ★追加: 行チェック */}
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleOne(c.id, e.target.checked)}
                    disabled={!canEdit}
                    title={!canEdit ? "閲覧のみ" : "送信先に含める"}
                  />
                </td>
                {/* 氏名 */}
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{c.name}</td>
                {/* 会社名 */}
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>{c.companyName ?? ""}</td>
                {/* メルアド */}
                <td style={{ padding: 8, borderBottom: "1px solid #f2f2f2" }}>
                  {c.email ?? ""}
                  {canEdit && emailMissing && checked && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: "#fff3cd",
                        fontSize: 12,
                      }}
                    >
                      送信時スキップ
                    </span>
                  )}
                </td>
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
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 12, color: "#666" }}>
                該当なし
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
