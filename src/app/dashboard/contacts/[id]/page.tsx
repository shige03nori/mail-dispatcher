import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ContactForm from "../ui/ContactForm";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!contact) redirect("/dashboard/contacts");

  const canEdit = session.role !== "VIEWER";

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>連絡先 詳細{canEdit ? "/編集" : ""}</h1>
      <div style={{ marginTop: 16 }}>
        <ContactForm
          mode="update"
          canEdit={canEdit}
          initial={{
            id: contact.id,
            name: contact.name,
            companyName: contact.companyName ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            note: contact.note ?? "",
          }}
        />
      </div>
    </main>
  );
}
