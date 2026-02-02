import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await ctx.params;

  const contact = await prisma.contact.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!contact) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, contact });
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
  const name = (body?.name ?? "").toString().trim();
  const companyName = (body?.companyName ?? "").toString().trim() || null;
  const email = (body?.email ?? "").toString().trim().toLowerCase() || null;
  const phone = (body?.phone ?? "").toString().trim() || null;
  const note = (body?.note ?? "").toString().trim() || null;

  if (!name) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });

  const updated = await prisma.contact.update({
    where: { id },
    data: { name, companyName, email, phone, note, updatedByUserId: session.userId,},
  });

  return NextResponse.json({ ok: true, contact: updated });
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
