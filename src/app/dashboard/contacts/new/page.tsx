import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import ContactForm from "../ui/ContactForm";

export default async function NewContactPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "VIEWER") redirect("/dashboard/contacts");

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>連絡先 新規作成</h1>
      <div style={{ marginTop: 16 }}>
        <ContactForm mode="create" />
      </div>
    </main>
  );
}
