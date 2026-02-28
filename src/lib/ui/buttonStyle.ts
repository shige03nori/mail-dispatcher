import type { CSSProperties } from "react";

export const buttonStyle = {

  base:{
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
  } satisfies CSSProperties,

  primary: {
    background: "#f97316", // オレンジ
    color: "#fff",
    borderColor: "#f97316",
  } satisfies CSSProperties,

  primaryHover: {
    background: "#ea580c",
    borderColor: "#ea580c",
  } satisfies CSSProperties,

  // 危険操作（アーカイブ）
  danger: {
    background: "#dc2626", // 赤
    color: "#fff",
    borderColor: "#dc2626",
  } satisfies CSSProperties,

  dangerHover: {
    background: "#b91c1c",
    borderColor: "#b91c1c",
  } satisfies CSSProperties,

  // 回復操作（復元）
  success: {
    background: "#16a34a", // 緑
    color: "#fff",
    borderColor: "#16a34a",
  } satisfies CSSProperties,

  successHover: {
    background: "#15803d",
    borderColor: "#15803d",
  } satisfies CSSProperties,

  secondary: {
    background: "#fff",
    color: "#111",
  } satisfies CSSProperties,

  subtle: {
    background: "#fafafa",
    color: "#111",
  } satisfies CSSProperties,
};
