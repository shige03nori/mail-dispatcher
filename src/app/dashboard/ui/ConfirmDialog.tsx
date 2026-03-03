"use client";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "削除",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 100,
        }}
      />

      {/* ダイアログ */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 101,
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: 12,
          padding: "24px 28px",
          width: 360,
          maxWidth: "calc(100vw - 32px)",
          color: "#fff",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#ccc", marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="btn-custom01 btn-custom01-secondary">
            キャンセル
          </button>
          <button onClick={onConfirm} className="btn-custom01 btn-custom01-danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
