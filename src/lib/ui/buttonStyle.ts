import type { CSSProperties } from "react";

export const buttonStyle = {
  base: {
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    border: "1px solid #ddd",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
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

  secondary: {
    background: "#fff",
    color: "#111",
  } satisfies CSSProperties,

  subtle: {
    background: "#fafafa",
    color: "#111",
  } satisfies CSSProperties,
};
