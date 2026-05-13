"use client";

import { useState } from "react";
import Link from "next/link";

type Role = "ADMIN" | "EDITOR" | "VIEWER";

interface Props {
  role: Role;
}

// TODO: ハンバーガーメニュー（スライドインサイドバー付きナビゲーション）を実装する
//
// 仕様:
// - 画面上部に固定のトップバーを配置する
// - トップバー左端にハンバーガーボタン（三本線）を置き、クリックでサイドバーを開く
// - サイドバーを開くと背景にオーバーレイが出て、クリックで閉じられる
// - サイドバーにはナビゲーションリンクを並べる:
//   - ダッシュボード・連絡先・連絡先追加（全ロール）
//   - ユーザー管理（ADMIN のみ）
//   - ユーザー招待・テンプレ作成・メール作成（ADMIN / EDITOR のみ）
//   - テンプレ一覧・配信履歴（全ロール）
// - サイドバー下部にログアウトボタンを配置する
//
// ヒント:
// - useState(false) で isOpen（開閉状態）を管理する
// - サイドバーは position: fixed で画面左に固定し、transform: translateX(-100%) / translateX(0) で開閉する
// - ログアウトは POST /api/auth/logout → window.location.href = "/login"

export function HamburgerMenu({ role }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: ハンバーガーメニューの実装
  return (
    <>
      {/* TODO: トップバー・ハンバーガーボタン・オーバーレイ・サイドバーを実装する */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, background: "#333", zIndex: 49 }}>
        <button onClick={() => setIsOpen(true)} style={{ margin: 8 }}>
          ☰ メニュー
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 51 }}
        >
          <nav
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, background: "#fff", zIndex: 52, padding: 16 }}
          >
            <p>TODO: ナビゲーションリンクを実装してください（role: {role}）</p>
            <button onClick={() => setIsOpen(false)}>閉じる</button>
          </nav>
        </div>
      )}
    </>
  );
}
