"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formStyle } from "@/lib/ui/formStyle";
import { tableStyle } from "@/lib/ui/tableStyle";
import { ConfirmDialog } from "@/app/dashboard/ui/ConfirmDialog";

type Group = { id: string; name: string };

type Contact = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  note: string | null;
  createdAt: string | Date;
  groups: string[]; // ContactGroup IDs
};

export default function ContactsTable({
  initialContacts,
  initialGroups,
  canEdit,
}: {
  initialContacts: Contact[];
  initialGroups: Group[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [msg, setMsg] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const groupMap = useMemo(
    () => new Map(initialGroups.map((g) => [g.id, g.name])),
    [initialGroups]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filterGroupId && !c.groups.includes(filterGroupId)) return false;
      if (!s) return true;
      const hay = [c.name, c.companyName ?? "", c.email ?? "", c.phone ?? "", c.note ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [q, filterGroupId, contacts]);

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

  const allChecked =
    filtered.length > 0 && filtered.every((c) => selected[c.id] === true);
  const someChecked =
    filtered.some((c) => selected[c.id] === true) && !allChecked;

  function toggleAllVisible(next: boolean) {
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
    setMsg("削除中...");
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
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
    setConfirmId(null);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="検索（氏名/会社/メール/電話/メモ）"
          style={{ ...formStyle.input, flex: 1, minWidth: 180 }}
        />
        <select
          value={filterGroupId}
          onChange={(e) => setFilterGroupId(e.target.value)}
          style={{ ...formStyle.select, width: 180 }}
        >
          <option value="">すべてのグループ</option>
          {initialGroups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button
          onClick={async () => {
            setMsg("更新中...");
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (data?.ok) {
              setContacts(data.contacts);
              setMsg("更新しました");
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
          className="btn-custom01"
        >
          再読み込み
        </button>

        {/* エクスポート */}
        <a
          href="/api/contacts/export"
          download
          className="btn-custom01 btn-custom01-navy"
        >
          CSV出力
        </a>

        {/* インポート */}
        {canEdit && (
          <>
            <label className="btn-custom01 btn-custom01-navy" style={{ cursor: "pointer" }}>
              CSV取込
              <input
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                disabled={importing}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImporting(true);
                  setMsg("インポート中...");
                  const form = new FormData();
                  form.append("file", file);
                  const res = await fetch("/api/contacts/import", { method: "POST", body: form });
                  const data = await res.json().catch(() => ({}));
                  if (data?.ok) {
                    setMsg(`インポート完了: ${data.created}件追加、${data.skipped}件スキップ`);
                    // 一覧を再取得
                    const r2 = await fetch("/api/contacts");
                    const d2 = await r2.json();
                    if (d2?.ok) setContacts(d2.contacts);
                  } else {
                    setMsg(`インポート失敗: ${data?.error ?? "unknown"}`);
                  }
                  e.target.value = "";
                  setImporting(false);
                }}
              />
            </label>
          </>
        )}

        {canEdit && (
          <button
            onClick={goCompose}
            disabled={selectedCount === 0 || isPending}
            className="btn-custom01 btn-custom01-primary"
            title={selectedCount === 0 ? "送信先を選択してください" : "選択した連絡先へメールを作成"}
            style={{ marginLeft: "auto" }}
          >
            メール作成
          </button>
        )}
      </div>

      {canEdit && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #333" }}>
          選択: <b>{selectedCount}</b>件
          {selectedCount > 0 && (
            <span style={{ marginLeft: 8, color: "#aaa" }}>
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
                color: "#aaa",
                cursor: "pointer",
              }}
            >
              選択解除
            </button>
          )}
        </div>
      )}

      {msg && <div style={{ marginTop: 10, padding: 10, border: "1px solid #333" }}>{msg}</div>}

      <div className="table-scroll-wrap" style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <table style={tableStyle.table}>
          <thead style={tableStyle.thead}>
            <tr>
              <th style={{ ...tableStyle.th, width: 44 }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onChange={(e) => toggleAllVisible(e.target.checked)}
                  disabled={!canEdit || filtered.length === 0}
                />
              </th>
              {["氏名", "会社", "メール", "電話", "グループ", "操作"].map((h) => (
                <th key={h} style={tableStyle.th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => {
              const checked = !!selected[c.id];
              const emailMissing = !c.email;

              return (
                <tr key={c.id}>
                  <td style={tableStyle.td}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleOne(c.id, e.target.checked)}
                      disabled={!canEdit}
                    />
                  </td>
                  <td style={tableStyle.td}>{c.name}</td>
                  <td style={tableStyle.td}>{c.companyName ?? ""}</td>
                  <td style={tableStyle.td}>
                    {c.email ?? ""}
                    {canEdit && emailMissing && checked && (
                      <span style={{ marginLeft: 8, padding: "2px 6px", borderRadius: 999, background: "#fff3cd", color: "#762d03", fontSize: 12 }}>
                        送信時スキップ
                      </span>
                    )}
                  </td>
                  <td style={tableStyle.td}>{c.phone ?? ""}</td>
                  <td style={tableStyle.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {c.groups.map((gid) => (
                        <span
                          key={gid}
                          style={{ padding: "2px 8px", background: "#1d4ed8", color: "#fff", borderRadius: 999, fontSize: 12 }}
                        >
                          {groupMap.get(gid) ?? gid}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={tableStyle.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/dashboard/contacts/${c.id}`} className="btn-custom01">
                        詳細/編集
                      </Link>
                      {canEdit ? (
                        <button onClick={() => setConfirmId(c.id)} className="btn-custom01 btn-custom01-danger">削除</button>
                      ) : (
                        <span style={{ color: "#aaa" }}>閲覧のみ</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 12, color: "#aaa" }}>該当なし</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="連絡先を削除"
        message="この連絡先を削除しますか？この操作は元に戻せません。"
        onConfirm={() => confirmId && del(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
