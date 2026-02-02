import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession(); // ← ここがポイント
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const org = await prisma.organization.findUnique({ where: { id: session.organizationId } });

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>ダッシュボード</h1>
        <LogoutButton />
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
        <div><b>組織</b>: {org?.name ?? "(unknown)"}</div>
        <div><b>ユーザー</b>: {user?.email ?? "(unknown)"}</div>
        <div><b>ロール</b>: {session.role}</div>
      </div>
      <Link
        href="/dashboard/invite"
        style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, display: "inline-block" }}
      >
        ユーザー招待
      </Link>
<Link
        href="/dashboard/contacts"
        style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, display: "inline-block" }}
      >
        連絡先
      </Link>
    </main>
  );
}
