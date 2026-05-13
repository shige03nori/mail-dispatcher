// TODO: テーブル要素の inline style オブジェクトを定義する
// ヒント: table / thead / th / td それぞれのスタイルを定義する
// ヒント: th は文字色・フォントウェイト・パディング・ボーダーなどを設定する
// ヒント: td は行ごとに区切り線が見えるようにボーダーを入れると読みやすい
//
// 例:
// export const tableStyle = {
//   table: { width: "100%", borderCollapse: "collapse" as const },
//   th: { textAlign: "left" as const, padding: 10, borderBottom: "2px solid #e5e7eb", fontWeight: 700 },
//   td: { padding: 10, borderTop: "1px solid #f2f2f2" },
// };

export const tableStyle = {
  table: { width: "100%", borderCollapse: "collapse" as const },
  thead: {},
  th: { textAlign: "left" as const, padding: 10 },
  td: { padding: 10 },
};
