"use server";

// TODO: テンプレートの Server Action を実装する
//
// 実装する関数:
// 1. createTemplateAction(formData)
//    - getSession() で認証・権限チェック（VIEWER は禁止）
//    - formData から name / subject / textBody / htmlBody を取り出す
//    - templateSchema（Zod）でバリデーション → エラーなら /new?err=... へリダイレクト
//    - prisma.emailTemplate.create() で保存
//    - 成功したら /dashboard/templates/{id}/edit?ok=1 へリダイレクト
//
// 2. updateTemplateAction(templateId, formData)
//    - 同様の認証・バリデーション
//    - prisma.emailTemplate.updateMany で organizationId スコープを使って更新
//    - 成功したら /dashboard/templates/{id}/edit?ok=1 へリダイレクト
//
// 3. archiveTemplateAction(templateId)
//    - isArchived: true に更新して /dashboard/templates?ok=archived へリダイレクト
//
// 4. restoreTemplateAction(templateId)
//    - isArchived: false に更新して /dashboard/templates?ok=restored へリダイレクト
//
// ヒント:
// - "use server" ディレクティブは必須（このファイルの先頭に記述）
// - redirect() は例外として throw されるので、catch で isRedirectError(e) を確認してから再スローする
//   import { isRedirectError } from "next/dist/client/components/redirect-error"
// - revalidatePath("/dashboard/templates") でページキャッシュを更新する

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { templateSchema } from "@/lib/schemas/template";

export async function createTemplateAction(formData: FormData) {
  throw new Error("TODO: createTemplateAction を実装してください");
}

export async function updateTemplateAction(templateId: string, formData: FormData) {
  throw new Error("TODO: updateTemplateAction を実装してください");
}

export async function archiveTemplateAction(templateId: string) {
  throw new Error("TODO: archiveTemplateAction を実装してください");
}

export async function restoreTemplateAction(templateId: string) {
  throw new Error("TODO: restoreTemplateAction を実装してください");
}
