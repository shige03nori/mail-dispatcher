import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { contactSchema } from "@/lib/schemas/contact";

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

  const parsed = contactSchema.safeParse(body ?? {});
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: firstIssue?.message ?? "validation_error" }, { status: 400 });
  }

  const name = parsed.data.name.trim();
  const companyName = (parsed.data.companyName ?? "").trim() || null;
  const email = (parsed.data.email ?? "").trim().toLowerCase() || null;
  const phone = (parsed.data.phone ?? "").trim() || null;
  const note = (parsed.data.note ?? "").trim() || null;
  const groupIds = parsed.data.groupIds ?? [];

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
