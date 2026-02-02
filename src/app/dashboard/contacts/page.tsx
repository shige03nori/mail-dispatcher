import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ContactsTable from "./ContactsTable";

export default async function ContactsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const contacts = await prisma.contact.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  const canEdit = session.role !== "VIEWER";

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>連絡先</h1>
        {canEdit && (
          <Link
            href="/dashboard/contacts/new"
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            新規作成
          </Link>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <ContactsTable initialContacts={contacts} canEdit={canEdit} />
      </div>
    </main>
  );
}
