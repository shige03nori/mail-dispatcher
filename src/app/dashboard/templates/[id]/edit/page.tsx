import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { updateTemplateAction } from "../../actions";
import { buttonStyle } from "@/lib/ui/buttonStyle";

export default async function TemplateEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  const template = await prisma.emailTemplate.findFirst({
    where: { id, organizationId: session.organizationId },
    select: {
      id: true,
      name: true,
      subject: true,
      textBody: true,
      htmlBody: true,
      isArchived: true,
      updatedAt: true,
    },
  });

  if (!template) redirect("/dashboard/templates?err=notfound");

  const canEdit = session.role !== "VIEWER";

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>テンプレ編集</h1>
        <Link href="/dashboard/templates" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
          一覧へ
        </Link>
      </div>

      {(sp.ok || sp.err) && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid",
            borderColor: sp.err ? "#fecaca" : "#bbf7d0",
            background: sp.err ? "#fef2f2" : "#f0fdf4",
            color: sp.err ? "#991b1b" : "#14532d",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {sp.err ? `エラー: ${sp.err}` : "保存しました"}
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        最終更新: {template.updatedAt.toLocaleString("ja-JP")}
        {template.isArchived && <span style={{ marginLeft: 8, color: "#111", background: "#fff3cd", padding: "2px 8px", borderRadius: 999 }}>アーカイブ</span>}
      </div>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        {canEdit ? (
          <form action={updateTemplateAction.bind(null, template.id)} style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 13 }}>テンプレ名</label>
            <input name="name" defaultValue={template.name} style={{ width: "100%", padding: 10 }} />

            <label style={{ fontSize: 13 }}>件名</label>
            <input name="subject" defaultValue={template.subject} style={{ width: "100%", padding: 10 }} />

            <label style={{ fontSize: 13 }}>本文（text）</label>
            <textarea
              name="textBody"
              defaultValue={template.textBody}
              rows={12}
              style={{ width: "100%", padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />

            <details>
              <summary style={{ cursor: "pointer", color: "#333" }}>HTML本文（任意）</summary>
              <textarea
                name="htmlBody"
                defaultValue={template.htmlBody ?? ""}
                rows={12}
                style={{ width: "100%", padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              />
            </details>

            <button type="submit" style={{ ...buttonStyle.base, ...buttonStyle.primary }}>
              保存
            </button>
          </form>
        ) : (
          <div style={{ color: "#666" }}>閲覧のみ（編集権限がありません）</div>
        )}
      </section>
    </main>
  );
}
