"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formStyle } from "@/lib/ui/formStyle";
import { contactSchema } from "@/lib/schemas/contact";

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

// TODO: 連絡先フォームコンポーネントを実装する（新規作成・編集共通）
//
// 仕様:
// - 入力項目: 氏名（必須）・会社名・メール・電話・メモ・グループ（複数選択）
// - 送信前に contactSchema（Zod）でバリデーションを行い、エラーを各フィールド横に表示する
// - mode === "create" のとき: POST /api/contacts へ送信し、成功後 /dashboard/contacts へ遷移
// - mode === "update" のとき: PUT /api/contacts/{id} へ送信し、成功後「保存しました」と表示
// - canEdit が false（VIEWER）のとき全フィールドを disabled にし、送信ボタンを非表示にする
// - グループ: useEffect で GET /api/groups を呼んで一覧を取得
// - インライングループ作成: POST /api/groups で新しいグループを作り、作成後に選択済みにする
//   ※ フォーム内の「Enter」キーでグループを追加する場合、form の submit が走らないよう
//     onKeyDown で e.preventDefault() を呼ぶこと
//
// ヒント:
// - contactSchema.safeParse(payload) でバリデーション
// - parsed.error.issues で全エラーを取り出し、フィールドごとに最初のメッセージを表示する
// - グループ選択はチェックボックスより「クリックで選択/解除」するリスト形式が見やすい

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
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setGroups(d.groups); })
      .catch(() => {});
  }, []);

  // TODO: フォームのsubmit処理・グループ作成・グループ選択トグルを実装する
  return (
    <form onSubmit={(e) => { e.preventDefault(); alert("TODO: ContactForm を実装してください"); }} style={{ display: "grid", gap: 10 }}>
      <label>氏名（必須）</label>
      <input value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} style={formStyle.input} />
      {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}

      <label>メール</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!canEdit} style={formStyle.input} />
      {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}

      <label>メモ</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={!canEdit} style={formStyle.textarea} />

      <p>グループ: {groupIds.length}件選択中</p>

      <div style={{ display: "flex", gap: 10 }}>
        {canEdit && <button type="submit">{mode === "create" ? "作成" : "更新"}</button>}
        <Link href="/dashboard/contacts">連絡先一覧へ戻る</Link>
      </div>

      {msg && <div>{msg}</div>}
    </form>
  );
}
