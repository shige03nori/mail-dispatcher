"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";

function norm(s: unknown): string {
  return String(s ?? "").trim();
}

function mustEditRole(role: string) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function createTemplateAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!mustEditRole(session.role)) redirect("/dashboard/templates?err=forbidden");

  const name = norm(formData.get("name"));
  const subject = norm(formData.get("subject"));
  const textBody = String(formData.get("textBody") ?? "");
  const htmlBodyRaw = String(formData.get("htmlBody") ?? "");
  const htmlBody = htmlBodyRaw.trim() ? htmlBodyRaw : null;

  if (!name) redirect("/dashboard/templates/new?err=name");
  if (!subject) redirect("/dashboard/templates/new?err=subject");
  if (!textBody.trim()) redirect("/dashboard/templates/new?err=body");

  try {
    const created = await prisma.emailTemplate.create({
      data: {
        organizationId: session.organizationId,
        name,
        subject,
        textBody,
        htmlBody,
        createdByUserId: session.userId,
        updatedByUserId: session.userId,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/templates");
    redirect(`/dashboard/templates/${created.id}/edit?ok=1`);
  } catch (e: unknown) {
    // ✅ redirect() が投げる例外は握りつぶさない
    if (isRedirectError(e)) throw e;

    // ✅ Prisma の unique 制約違反だけ duplicate にする
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(`/dashboard/templates/new?err=duplicate`);
    }

    // それ以外は本当のエラーとして落とす（原因特定しやすい）
    throw e;
  }
}

export async function updateTemplateAction(templateId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!mustEditRole(session.role)) redirect("/dashboard/templates?err=forbidden");

  const name = norm(formData.get("name"));
  const subject = norm(formData.get("subject"));
  const textBody = String(formData.get("textBody") ?? "");
  const htmlBodyRaw = String(formData.get("htmlBody") ?? "");
  const htmlBody = htmlBodyRaw.trim() ? htmlBodyRaw : null;

  if (!name) redirect(`/dashboard/templates/${templateId}/edit?err=name`);
  if (!subject) redirect(`/dashboard/templates/${templateId}/edit?err=subject`);
  if (!textBody.trim()) redirect(`/dashboard/templates/${templateId}/edit?err=body`);

  try {
    await prisma.emailTemplate.updateMany({
      where: { id: templateId, organizationId: session.organizationId },
      data: {
        name,
        subject,
        textBody,
        htmlBody,
        updatedByUserId: session.userId,
      },
    });

    revalidatePath("/dashboard/templates");
    redirect(`/dashboard/templates/${templateId}/edit?ok=1`);
  } catch (e: unknown) {
    if (isRedirectError(e)) throw e;

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(`/dashboard/templates/${templateId}/edit?err=duplicate`);
    }

    throw e;
  }
}

export async function archiveTemplateAction(templateId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!mustEditRole(session.role)) redirect("/dashboard/templates?err=forbidden");

  try {
    await prisma.emailTemplate.updateMany({
      where: { id: templateId, organizationId: session.organizationId },
      data: {
        isArchived: true,
        updatedByUserId: session.userId,
      },
    });

    revalidatePath("/dashboard/templates");
    redirect("/dashboard/templates?ok=archived");
  } catch (e: unknown) {
    if (isRedirectError(e)) throw e;
    throw e;
  }
}

export async function restoreTemplateAction(templateId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!mustEditRole(session.role)) redirect("/dashboard/templates?err=forbidden");

  try {
    await prisma.emailTemplate.updateMany({
      where: { id: templateId, organizationId: session.organizationId },
      data: {
        isArchived: false,
        updatedByUserId: session.userId,
      },
    });

    revalidatePath("/dashboard/templates");
    redirect("/dashboard/templates?ok=restored");
  } catch (e: unknown) {
    if (isRedirectError(e)) throw e;
    throw e;
  }
}
