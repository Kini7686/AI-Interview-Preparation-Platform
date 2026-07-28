"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { profileUpdateSchema } from "@/lib/validation/app.schema";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; field?: string };

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireSession();
  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    defaultRoleId: formData.get("defaultRoleId"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message: issue?.message ?? "Invalid profile",
      field: String(issue?.path[0] ?? ""),
    };
  }

  const role = await prisma.roleCatalogEntry.findUnique({
    where: { id: parsed.data.defaultRoleId },
  });
  if (!role) {
    return { ok: false, message: "Selected role was not found", field: "defaultRoleId" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      defaultRoleId: parsed.data.defaultRoleId,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
