"use client";

import { useState } from "react";
import Link from "next/link";

type Role = "ADMIN" | "EDITOR" | "VIEWER";

interface Props {
  role: Role;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function HamburgerMenu({ role }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const canEdit = role !== "VIEWER";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function handleDemoReset() {
    if (!confirm("デモデータをリセットします。連絡先・テンプレート・キャンペーンが初期状態に戻ります。よろしいですか？")) return;
    setResetLoading(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("リセットに失敗しました: " + (data.error ?? "不明なエラー"));
      }
    } finally {
      setResetLoading(false);
    }
  }

  const close = () => setIsOpen(false);

  return (
    <>
      {/* ハンバーガーボタン */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="メニューを開く"
        style={{
          position: "fixed",
          top: 16,
          left: "max(16px, calc((100vw - 1000px) / 2 + 16px))",
          zIndex: 50,
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "#0f172a",
          border: "2px solid #334155",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          padding: 0,
          transition: "background 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#1e293b")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#0f172a")}
      >
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
      </button>

      {/* オーバーレイ */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 51,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
      />

      {/* サイドバー */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          background: "#0f172a",
          color: "#fff",
          zIndex: 52,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 14px",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "0.02em" }}>
            Mail Dispatcher
          </span>
          <button
            onClick={close}
            aria-label="閉じる"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* ナビリンク */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          <NavLink href="/dashboard" onClick={close}>
            🏠 ダッシュボード
          </NavLink>

          <NavLink href="/dashboard/contacts" onClick={close}>
            📋 連絡先
          </NavLink>

          <NavLink href="/dashboard/contacts/new" onClick={close}>
            ➕ 連絡先追加
          </NavLink>

          <div style={{ margin: "8px 0", borderTop: "1px solid #1e293b" }} />

          {role === "ADMIN" && (
            <NavLink href="/dashboard/users" onClick={close}>
              👥 ユーザー管理
            </NavLink>
          )}

          {canEdit && (
            <NavLink href="/dashboard/invite" onClick={close}>
              ✉ ユーザー招待
            </NavLink>
          )}

          <div style={{ margin: "8px 0", borderTop: "1px solid #1e293b" }} />

          <NavLink href="/dashboard/templates" onClick={close}>
            📝 テンプレ一覧
          </NavLink>

          {canEdit && (
            <NavLink href="/dashboard/templates/new" onClick={close}>
              ＋ テンプレ作成
            </NavLink>
          )}

          <div style={{ margin: "8px 0", borderTop: "1px solid #1e293b" }} />

          {canEdit && (
            <NavLink href="/dashboard/compose" onClick={close}>
              📨 メール作成
            </NavLink>
          )}

          <NavLink href="/dashboard/campaigns" onClick={close}>
            📊 配信履歴
          </NavLink>

          {DEMO_MODE && (
            <>
              <div style={{ margin: "8px 0", borderTop: "1px solid #1e293b" }} />
              <div style={{ padding: "8px 16px" }}>
                <button
                  type="button"
                  disabled={resetLoading}
                  onClick={handleDemoReset}
                  className="btn-custom01 btn-custom01-secondary"
                  style={{ width: "100%", fontSize: 13 }}
                >
                  <span className="btn-custom01-front">
                    {resetLoading ? "リセット中..." : "デモデータをリセット"}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ロール表示 */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #1e293b",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          ロール:{" "}
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>{role}</span>
        </div>

        {/* ログアウト */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e293b" }}>
          <button
            onClick={logout}
            className="btn-custom01 btn-custom01-danger"
            style={{ width: "100%" }}
          >
            ログアウト
          </button>
        </div>
      </nav>
    </>
  );
}

function NavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "10px 20px",
        color: "#e2e8f0",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 500,
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "#1e293b")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}
