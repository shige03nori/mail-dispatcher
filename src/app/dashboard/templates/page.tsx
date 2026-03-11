import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";
import { formStyle } from "@/lib/ui/formStyle";
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
    <main style={{ maxWidth: 1000, margin: "0 auto 40px", padding: "72px 16px 16px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>テンプレート</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {canEdit && (
            <Link href="/dashboard/templates/new" className="btn-custom01 btn-custom01-primary">
              新規作成
            </Link>
          )}
        </div>
      </div>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #333", borderRadius: 10 }}>
        <form style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ display: "block", fontSize: 13, color: "#ddd" }}>検索</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="テンプレ名 / 件名"
              style={{ ...formStyle.input }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, color: "#ddd" }}>表示</label>
            <select name="archived" defaultValue={archived ? "1" : "0"} style={{ ...formStyle.select, width: 160, padding: 10 }}>
              <option value="0">有効のみ</option>
              <option value="1">アーカイブ</option>
            </select>
          </div>

          <button type="submit" className="btn-custom01">
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
        <div className="table-scroll-wrap" style={{ border: "1px solid #ddd", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
            <thead style={{ background: "#fff" }}>
              <tr>
                {["テンプレ名", "件名", "更新日時", "操作"].map((h) => (
                  <th key={h} style={tableStyle.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={tableStyle.td}>
                    <Link href={`/dashboard/templates/${t.id}/edit`} style={{ textDecoration: "underline", color: "#fff" }}>
                      {t.name}
                    </Link>
                  </td>
                  <td style={tableStyle.td}>{t.subject}</td>
                  <td style={tableStyle.td}>
                    {t.updatedAt.toLocaleString("ja-JP")}
                  </td>
                  <td style={tableStyle.td}>
                    {canEdit ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link
                          href={`/dashboard/compose?ids=&templateId=${encodeURIComponent(t.id)}`}
                          className="btn-custom01"
                        >
                          使う
                        </Link>

                        {t.isArchived ? (
                          <form action={restoreTemplateAction.bind(null, t.id)}>
                            <button type="submit" className="btn-custom01 btn-custom01-success">
                              復元
                            </button>
                          </form>
                        ) : (
                          <form action={archiveTemplateAction.bind(null, t.id)}>
                            <button
                              type="submit"
                              className="btn-custom01 btn-custom01-danger"
                            >
                              アーカイブ
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: 12 }}>閲覧のみ</span>
                    )}
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 12, color: "#aaa" }}>
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
