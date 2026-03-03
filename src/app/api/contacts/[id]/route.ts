import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { contactSchema } from "@/lib/schemas/contact";

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await ctx.params;

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!contact) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, contact: { ...contact, groups: parseGroups(contact.groups) } });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const existing = await prisma.contact.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!existing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => null);

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

  const updated = await prisma.contact.update({
    where: { id },
    data: { name, companyName, email, phone, note, groups: JSON.stringify(groupIds), updatedByUserId: session.userId },
  });

  return NextResponse.json({ ok: true, contact: { ...updated, groups: parseGroups(updated.groups) } });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const existing = await prisma.contact.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!existing) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
