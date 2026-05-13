"use client";

import { useState } from "react";
import { formStyle } from "@/lib/ui/formStyle";
import { ConfirmDialog } from "@/app/dashboard/ui/ConfirmDialog";

type Group = { id: string; name: string };

// TODO: グループ管理コンポーネントを実装する
//
// 仕様:
// - 折りたたみ式パネル（クリックで開閉）
// - グループ一覧をバッジ（タグ）形式で表示し、各バッジに × 削除ボタンを付ける
// - 削除前は ConfirmDialog で確認する
// - 新しいグループ名を入力して「追加」ボタンで POST /api/groups を呼ぶ
// - グループ削除は DELETE /api/groups/{id} を呼ぶ
// - 変更後に onGroupsChange コールバックで親に通知する
//
// ヒント:
// - useState で open（開閉）・groups（一覧）・confirmId（削除確認対象ID）を管理する

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
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // TODO: グループ追加・削除の処理を実装する
  return (
    <div style={{ marginBottom: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ width: "100%", padding: 12, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontWeight: 700 }}>
        {open ? "▼" : "▶"} グループ管理
      </button>
      {open && (
        <div style={{ padding: "0 12px 12px" }}>
          <p>TODO: グループ一覧・追加フォームを実装してください</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="新しいグループ名" style={formStyle.input} />
            <button type="button" onClick={() => alert("TODO: グループ追加を実装してください")}>追加</button>
          </div>
          {msg && <div style={{ color: "red" }}>{msg}</div>}
        </div>
      )}
      <ConfirmDialog open={confirmId !== null} title="グループを削除" message={`「${groups.find((g) => g.id === confirmId)?.name ?? ""}」を削除しますか？`} onConfirm={() => alert("TODO: 削除を実装")} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
