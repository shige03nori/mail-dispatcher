import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import InviteForm from "./InviteForm";

export default async function InvitePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>ユーザー招待</h1>
      <p style={{ marginTop: 8 }}>
        メールアドレスと権限を指定して招待リンクを発行します（開発中はコンソールに表示）。
      </p>

      <div style={{ marginTop: 16 }}>
        <InviteForm />
      </div>
    </main>
  );
}
