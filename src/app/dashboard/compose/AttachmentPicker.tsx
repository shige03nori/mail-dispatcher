"use client";

import { useRef, useState } from "react";

// TODO: 添付ファイル選択コンポーネントを実装する
//
// 仕様:
// - 「ファイルを選択」ボタンをクリックすると file input が開く（input は非表示）
// - 選択したファイルの名前を一覧で表示する（例: 📎 ファイル名.pdf ✕）
// - ✕ ボタンでファイルを一覧から除外できる
// - input の name は "attachments"（複数選択可: multiple 属性）
//
// ヒント:
// - useRef<HTMLInputElement>(null) で input 要素への参照を持つ
// - 除外は DataTransfer を使って input.files を更新する:
//   const dt = new DataTransfer();
//   files.filter(exclude).forEach(f => dt.items.add(f));
//   inputRef.current.files = dt.files;

export function AttachmentPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  // TODO: ファイル選択・除外の処理を実装する
  return (
    <div style={{ padding: "12px 14px", border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>添付ファイル（複数選択可）</div>
      <input ref={inputRef} type="file" name="attachments" multiple style={{ display: "none" }} onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))} />
      <button type="button" onClick={() => inputRef.current?.click()}>ファイルを選択</button>
      <ul>
        {fileNames.map((name, i) => (
          <li key={i}>📎 {name} <button type="button" onClick={() => setFileNames((prev) => prev.filter((_, j) => j !== i))}>✕</button></li>
        ))}
      </ul>
    </div>
  );
}
