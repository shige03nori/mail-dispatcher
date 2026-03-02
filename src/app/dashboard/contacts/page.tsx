import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ContactsTable from "./ContactsTable";

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export default async function ContactsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rawContacts, groups] = await Promise.all([
    prisma.contact.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.contactGroup.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
    }),
  ]);

  const contacts = rawContacts.map((c) => ({ ...c, groups: parseGroups(c.groups) }));
  const canEdit = session.role !== "VIEWER";

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>連絡先</h1>
        {canEdit && (
          <Link href="/dashboard/contacts/new" className="btn-custom01">
            新規作成
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
    </main>
  );
}
