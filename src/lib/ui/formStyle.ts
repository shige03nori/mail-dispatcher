import type { CSSProperties } from "react";

export const formStyle = {
  label: { display: "block", fontSize: 13, color: "#111" } satisfies CSSProperties,

  input: {
    width: "100%",
    padding: 10,
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    borderRadius: 10,
  } satisfies CSSProperties,

  select: {
    padding: 10,
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    borderRadius: 10,
  } satisfies CSSProperties,

  button: {
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontWeight: 800,
    background: "#fafafa",
    color: "#111",
  } satisfies CSSProperties,

  help: { fontSize: 12, color: "#555" } satisfies CSSProperties,
};
