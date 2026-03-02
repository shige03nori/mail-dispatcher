import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

type Body = {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  note?: string;
  groupIds?: string[];
};

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  const contacts = await prisma.contact.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "asc" },
  });

  const result = contacts
    .map((c) => ({ ...c, groups: parseGroups(c.groups) }))
    .filter((c) => !groupId || c.groups.includes(groupId));

  return NextResponse.json({ ok: true, contacts: result });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Body | null;

  const name = (body?.name ?? "").trim();
  const companyName = (body?.companyName ?? "").trim() || null;
  const email = (body?.email ?? "").trim().toLowerCase() || null;
  const phone = (body?.phone ?? "").trim() || null;
  const note = (body?.note ?? "").trim() || null;
  const groupIds = Array.isArray(body?.groupIds) ? (body.groupIds as string[]) : [];

  if (!name) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });

  if (email) {
    const dup = await prisma.contact.findFirst({
      where: { organizationId: session.organizationId, email },
    });
    if (dup) return NextResponse.json({ ok: false, error: "email_already_exists" }, { status: 409 });
  }

  const created = await prisma.contact.create({
    data: {
      organizationId: session.organizationId,
      name,
      companyName,
      email,
      phone,
      note,
      groups: JSON.stringify(groupIds),
      createdByUserId: session.userId,
      updatedByUserId: session.userId,
    },
  });

  return NextResponse.json({ ok: true, contact: { ...created, groups: parseGroups(created.groups) } });
}
