"use client";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// TODO: 汎用確認ダイアログコンポーネントを実装する
//
// 仕様:
// - open が false のとき null を返して非表示にする
// - 画面全体を覆う半透明オーバーレイの上にダイアログを表示する
// - ダイアログにはタイトル・メッセージ・「キャンセル」「確認」ボタンを配置する
// - オーバーレイクリックで onCancel を呼ぶ
// - 「確認」ボタンのラベルは confirmLabel で変更できる（デフォルト「削除」）
//
// ヒント:
// - position: fixed で画面中央（top:50%, left:50%, transform:translate(-50%,-50%)）に配置する
// - zIndex はオーバーレイよりダイアログを大きくする（例: overlay:100, dialog:101）

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "削除",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  // TODO: オーバーレイとダイアログを実装する
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100 }}>
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", padding: 24, borderRadius: 8, zIndex: 101 }}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onCancel}>キャンセル</button>
        <button onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  );
}
