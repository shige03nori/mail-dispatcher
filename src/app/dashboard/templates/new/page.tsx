import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createTemplateAction } from "../actions";
import { buttonStyle } from "@/lib/ui/buttonStyle";

export default async function TemplateNewPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "VIEWER") redirect("/dashboard/templates?err=forbidden");

  const sp = await searchParams;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>テンプレ作成</h1>
        <Link href="/dashboard/templates" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
          一覧へ
        </Link>
      </div>

      {sp.err && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#b91c1c" }}>
          エラー: {sp.err}
        </div>
      )}

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <form action={createTemplateAction} style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 13 }}>テンプレ名</label>
          <input name="name" style={{ width: "100%", padding: 10 }} />

          <label style={{ fontSize: 13 }}>件名</label>
          <input name="subject" style={{ width: "100%", padding: 10 }} />

          <label style={{ fontSize: 13 }}>
            本文（text） <span style={{ color: "#666" }}>※差し込み例: {"{{name}}"} / {"{{companyName}}"} / {"{{email}}"}</span>
          </label>
          <textarea
            name="textBody"
            rows={12}
            style={{ width: "100%", padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          />

          <details>
            <summary style={{ cursor: "pointer", color: "#333" }}>HTML本文（任意）</summary>
            <textarea
              name="htmlBody"
              rows={12}
              style={{ width: "100%", padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />
          </details>

          <button
            type="submit"
            style={{ 
                  ...buttonStyle.base,
                  ...buttonStyle.primary,
             }}
          >
            作成
          </button>
        </form>
      </section>
    </main>
  );
}
