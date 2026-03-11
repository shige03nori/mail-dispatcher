import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ContactsTable from "./ContactsTable";

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

const PER_PAGE = 50;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [total, rawContacts, groups] = await Promise.all([
    prisma.contact.count({ where: { organizationId: session.organizationId } }),
    prisma.contact.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.contactGroup.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
    }),
  ]);

  const contacts = rawContacts.map((c) => ({ ...c, groups: parseGroups(c.groups) }));
  const canEdit = session.role !== "VIEWER";
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto 40px", padding: "72px 16px 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>連絡先</h1>
        {canEdit && (
          <Link href="/dashboard/contacts/new" className="btn-custom01 btn-custom01-success">
            連絡先追加
          </Link>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <ContactsTable
          initialContacts={contacts}
          initialGroups={groups}
          canEdit={canEdit}
        />
      </div>

      {/* ページネーション */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#888" }}>
          全{total}件中 {(page - 1) * PER_PAGE + 1}〜{Math.min(page * PER_PAGE, total)}件表示
        </span>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {page > 1 && (
            <Link
              href={`/dashboard/contacts?page=${page - 1}`}
              className="btn-custom01 btn-custom01-secondary"
            >
              ← 前へ
            </Link>
          )}
          <span style={{ padding: "4px 10px", fontSize: 13, alignSelf: "center" }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/contacts?page=${page + 1}`}
              className="btn-custom01 btn-custom01-secondary"
            >
              次へ →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
