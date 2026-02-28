import type { CSSProperties } from "react";

const controlBase: CSSProperties = {
  height: 40,
  padding: "0 12px",
  lineHeight: "1.4",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#000",
  color: "#fff",
};

export const formStyle = {
  label: {
    display: "block",
    fontSize: 13,
    color: "#111",
  } satisfies CSSProperties,

  input: {
    ...controlBase,
    width: "100%",
  } satisfies CSSProperties,

  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 10,
    color: "#fff",
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#000",
  } satisfies CSSProperties,

  select: {
    ...controlBase,
    appearance: "none",       // OSデザイン差を減らす
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath d='M5.5 7.5L10 12l4.5-4.5'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "14px",
    paddingRight: 32,
  } satisfies CSSProperties,

  button: {
    height: 36,
    padding: "0 14px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontWeight: 800,
    background: "#fafafa",
    color: "#111",
  } satisfies CSSProperties,

  help: {
    fontSize: 12,
    color: "#555",
  } satisfies CSSProperties,
};
