import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

/** CSVの1セルをエスケープ */
function csvCell(v: string | null | undefined): string {
  const s = v ?? "";
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [contacts, groups] = await Promise.all([
    prisma.contact.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.contactGroup.findMany({
      where: { organizationId: session.organizationId },
    }),
  ]);

  const groupMap = new Map(groups.map((g) => [g.id, g.name]));

  const header = "name,email,phone,companyName,note,groups";
  const rows = contacts.map((c) => {
    const groupNames = parseGroups(c.groups)
      .map((id) => groupMap.get(id) ?? "")
      .filter(Boolean)
      .join("|");
    return [
      csvCell(c.name),
      csvCell(c.email),
      csvCell(c.phone),
      csvCell(c.companyName),
      csvCell(c.note),
      csvCell(groupNames),
    ].join(",");
  });

  const csv = [header, ...rows].join("\r\n");
  const filename = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
