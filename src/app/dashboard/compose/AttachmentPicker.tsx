"use client";

import { useRef, useState } from "react";

export function AttachmentPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setFileNames(files.map((f) => f.name));
  }

  function removeFile(index: number) {
    const dt = new DataTransfer();
    const files = Array.from(inputRef.current?.files ?? []);
    files.forEach((f, i) => { if (i !== index) dt.items.add(f); });
    if (inputRef.current) inputRef.current.files = dt.files;
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div style={{ padding: "12px 14px", border: "1px solid #fff", borderRadius: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        添付ファイル
        <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 8 }}>（複数選択可）</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="attachments"
        multiple
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <button
        type="button"
        className="btn-custom01"
        onClick={() => inputRef.current?.click()}
      >
        <span className="btn-custom01-front">ファイルを選択</span>
      </button>

      {fileNames.length > 0 && (
        <ul style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4, listStyle: "none", padding: 0 }}>
          {fileNames.map((name, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span style={{ color: "#94a3b8" }}>📎</span>
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13, padding: "0 4px" }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
