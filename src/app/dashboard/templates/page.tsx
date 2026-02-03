import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";
import { archiveTemplateAction, restoreTemplateAction } from "./actions";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string; ok?: string; err?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const archived = sp.archived === "1";

  const templates = await prisma.emailTemplate.findMany({
    where: {
      organizationId: session.organizationId,
      isArchived: archived,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { subject: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      subject: true,
      updatedAt: true,
      isArchived: true,
    },
    take: 200,
  });

  const canEdit = session.role !== "VIEWER";

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>テンプレート</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/contacts" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
            連絡先
          </Link>
          <Link href="/dashboard/campaigns" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
            Campaigns
          </Link>
          {canEdit && (
            <Link href="/dashboard/templates/new" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontWeight: 800 }}>
              新規作成
            </Link>
          )}
        </div>
      </div>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <form style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ display: "block", fontSize: 13, color: "#333" }}>検索</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="テンプレ名 / 件名"
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, color: "#333" }}>表示</label>
            <select name="archived" defaultValue={archived ? "1" : "0"} style={{ width: 160, padding: 10 }}>
              <option value="0">有効のみ</option>
              <option value="1">アーカイブ</option>
            </select>
          </div>

          <button type="submit" style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, fontWeight: 800 }}>
            絞り込む
          </button>
        </form>

        {(sp.ok || sp.err) && (
          <div style={{ marginTop: 10, fontSize: 13, color: sp.err ? "#b91c1c" : "#166534" }}>
            {sp.err ? `エラー: ${sp.err}` : `OK: ${sp.ok}`}
          </div>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#fafafa" }}>
              <tr>
                {["テンプレ名", "件名", "更新日時", "操作"].map((h) => (
                  <th key={h} style={tableStyle.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>
                    <Link href={`/dashboard/templates/${t.id}/edit`} style={{ color: "#111", textDecoration: "underline" }}>
                      {t.name}
                    </Link>
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{t.subject}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", color: "#111" }}>
                    {t.updatedAt.toLocaleString("ja-JP")}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>
                    {canEdit ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link
                          href={`/dashboard/compose?ids=&templateId=${encodeURIComponent(t.id)}`}
                          style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8 }}
                        >
                          使う
                        </Link>

                        {t.isArchived ? (
                          <form action={restoreTemplateAction.bind(null, t.id)}>
                            <button type="submit" style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8 }}>
                              復元
                            </button>
                          </form>
                        ) : (
                          <form action={archiveTemplateAction.bind(null, t.id)}>
                            <button
                              type="submit"
                              style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, background: "#fff3cd", color: "#111" }}
                            >
                              アーカイブ
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#666", fontSize: 12 }}>閲覧のみ</span>
                    )}
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 12, color: "#666" }}>
                    テンプレがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
