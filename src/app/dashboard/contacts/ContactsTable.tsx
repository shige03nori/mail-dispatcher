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

// TODO: 連絡先テーブルコンポーネントを実装する
//
// 仕様:
// - 検索バー（氏名/会社/メール/電話/メモ）でリアルタイムフィルタリング
// - グループ選択で絞り込み（すべて / 各グループ）
// - 各行にチェックボックスを付け、選択した連絡先にまとめてメールを送れる
//   → 「メール作成」ボタンで /dashboard/compose?ids={id1,id2,...} へ遷移
// - 削除ボタン → ConfirmDialog で確認後 DELETE /api/contacts/{id} を呼ぶ
// - CSV出力（GET /api/contacts/export）・CSV取込（POST /api/contacts/import）ボタン
// - canEdit が false（VIEWER）のときは編集系ボタンを非表示にする
//
// ヒント:
// - useState と useMemo でフィルタリング・チェック状態を管理する
// - 全選択チェックボックスは indeterminate（一部選択）状態を ref で設定する
// - useRouter と useTransition でページ遷移のローディング状態を管理する

export default function ContactsTable({
  initialContacts,
  initialGroups,
  canEdit,
}: {
  initialContacts: Contact[];
  initialGroups: Group[];
  canEdit: boolean;
}) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [q, setQ] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");

  // TODO: 連絡先テーブルの実装
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="検索（氏名/会社/メール/電話/メモ）" />
      <p>TODO: ContactsTable を実装してください（{contacts.length}件）</p>
      <table style={tableStyle.table}>
        <thead>
          <tr>
            <th style={tableStyle.th}>氏名</th>
            <th style={tableStyle.th}>メール</th>
            <th style={tableStyle.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id}>
              <td style={tableStyle.td}>{c.name}</td>
              <td style={tableStyle.td}>{c.email ?? ""}</td>
              <td style={tableStyle.td}>
                <Link href={`/dashboard/contacts/${c.id}`}>詳細/編集</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
