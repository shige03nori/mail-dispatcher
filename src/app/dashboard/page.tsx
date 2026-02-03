import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";
import Link from "next/link";
import type { CSSProperties } from "react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });

  const canEdit = session.role !== "VIEWER";

  const buttonStyle: CSSProperties = {
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: 10,
    fontWeight: 800,
    color: "#111",
    background: "#fff",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>ダッシュボード</h1>
        <LogoutButton />
      </div>

      {/* 組織・ユーザー情報 */}
      <section
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
        }}
      >
        <div>
          <b>組織</b>: {org?.name ?? "(unknown)"}
        </div>
        <div>
          <b>ユーザー</b>: {user?.email ?? "(unknown)"}
        </div>
        <div>
          <b>ロール</b>: {session.role}
        </div>
      </section>

      {/* アクション */}
      <section style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          {canEdit && (
            <Link href="/dashboard/invite" style={buttonStyle}>
              ユーザー招待
            </Link>
          )}

          <Link href="/dashboard/contacts" style={buttonStyle}>
            連絡先
          </Link>

          <Link href="/dashboard/templates" style={buttonStyle}>
            テンプレ一覧
          </Link>

          {canEdit && (
            <Link
              href="/dashboard/templates/new"
              style={{
                ...buttonStyle,
                background: "#fafafa",
              }}
            >
              テンプレ作成
            </Link>
          )}

          <Link href="/dashboard/campaigns" style={buttonStyle}>
            配信履歴
          </Link>
        </div>

        {!canEdit && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            ※ VIEWER 権限では作成系（ユーザー招待・テンプレ作成）は表示されません
          </div>
        )}
      </section>
    </main>
  );
}
