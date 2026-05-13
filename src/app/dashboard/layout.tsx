// TODO: ダッシュボード共通レイアウトを実装する
//
// 仕様:
// - getSession() でセッションからロール（ADMIN/EDITOR/VIEWER）を取得する
// - HamburgerMenu コンポーネントに role を渡してレンダリングする
// - children（各ページのコンテンツ）をその下に表示する
//
// ヒント:
// - このファイルは Server Component（async function）で実装する
// - セッションがなければ role のデフォルトを "VIEWER" にしておく
// - HamburgerMenu は "use client" コンポーネントなので import して使える

import { getSession } from "@/lib/auth/session";
import { HamburgerMenu } from "./HamburgerMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: getSession() でロールを取得し、HamburgerMenu と children をレンダリングする
  return (
    <>
      <div>TODO: HamburgerMenu を表示する</div>
      {children}
    </>
  );
}
