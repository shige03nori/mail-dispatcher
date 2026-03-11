import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { tableStyle } from "@/lib/ui/tableStyle";
import SetPasswordForm from "./SetPasswordForm";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const members = await prisma.membership.findMany({
    where: { organizationId: session.organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "16px 16px 16px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>ユーザー管理</h1>
        <Link href="/dashboard" className="btn-custom01">
          ← ダッシュボードへ
        </Link>
      </div>

      <p style={{ marginTop: 8, fontSize: 13, color: "#aaa" }}>
        メンバー一覧。パスワードを設定するとパスワードログインが有効になります。
      </p>

      <div className="table-scroll-wrap" style={{ marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 10 }}>
        <table style={{ ...tableStyle.table, color: "#fff" }}>
          <thead style={{ background: "#fff" }}>
            <tr>
              <th style={{ ...tableStyle.th, color: "#111" }}>名前</th>
              <th style={{ ...tableStyle.th, color: "#111" }}>メールアドレス</th>
              <th style={{ ...tableStyle.th, color: "#111" }}>ロール</th>
              <th style={{ ...tableStyle.th, color: "#111" }}>パスワード</th>
              <th style={{ ...tableStyle.th, color: "#111" }}>パスワード設定</th>
            </tr>
          </thead>
          <tbody>
            {members.map(({ user, role }) => (
              <tr key={user.id}>
                <td style={{ ...tableStyle.td, color: "#fff" }}>{user.name ?? "-"}</td>
                <td style={{ ...tableStyle.td, color: "#fff" }}>{user.email}</td>
                <td style={{ ...tableStyle.td, color: "#fff" }}>{role}</td>
                <td style={{ ...tableStyle.td }}>
                  {user.passwordHash ? (
                    <span style={{ color: "#4ade80", fontWeight: 600 }}>設定済み</span>
                  ) : (
                    <span style={{ color: "#666" }}>未設定</span>
                  )}
                </td>
                <td style={{ ...tableStyle.td }}>
                  <SetPasswordForm userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
