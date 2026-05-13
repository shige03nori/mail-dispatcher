import type { CSSProperties } from "react";

// TODO: フォーム要素の inline style オブジェクトを定義する
// ヒント: CSSProperties 型を使うと補完が効いて便利
// ヒント: input / textarea / select は幅・高さ・パディング・ボーダーなどを揃えると統一感が出る
// ヒント: satisfies CSSProperties を使うと型チェックをしながら export できる
//
// 例:
// export const formStyle = {
//   label: { display: "block", fontSize: 13 } satisfies CSSProperties,
//   input: { width: "100%", height: 40, padding: "0 12px", border: "1px solid #ccc", borderRadius: 6 } satisfies CSSProperties,
//   textarea: { width: "100%", minHeight: 120, padding: 10, border: "1px solid #ccc", borderRadius: 6 } satisfies CSSProperties,
//   select: { height: 40, padding: "0 12px", border: "1px solid #ccc", borderRadius: 6 } satisfies CSSProperties,
// };

export const formStyle = {
  label: {} satisfies CSSProperties,
  input: {} satisfies CSSProperties,
  textarea: {} satisfies CSSProperties,
  select: {} satisfies CSSProperties,
  button: {} satisfies CSSProperties,
  help: {} satisfies CSSProperties,
};
