"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { mapAuthError } from "@/lib/auth/errors";
import { resolveCallbackUrl } from "@/lib/auth/callback-url";
import { normalizeEmail } from "@/lib/domain/email";
import { magicLinkSchema } from "@/lib/validation/auth.schema";

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; message: string; field?: "email" };

/**
 * Start Google OAuth sign-in (FR-001, FR-002).
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const callbackUrl = resolveCallbackUrl(
    typeof formData.get("callbackUrl") === "string"
      ? (formData.get("callbackUrl") as string)
      : "/dashboard",
  );
  await signIn("google", { redirectTo: callbackUrl });
}

/**
 * Request a passwordless magic-link email (FR-002).
 */
export async function requestMagicLink(
  _prev: MagicLinkResult | null,
  formData: FormData,
): Promise<MagicLinkResult> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message: issue?.message ?? "Enter a valid email address",
      field: "email",
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const callbackUrl = resolveCallbackUrl(
    typeof formData.get("callbackUrl") === "string"
      ? (formData.get("callbackUrl") as string)
      : "/dashboard",
  );

  try {
    await signIn("resend", {
      email,
      redirectTo: callbackUrl,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    const type =
      error && typeof error === "object" && "type" in error
        ? String((error as { type: unknown }).type)
        : null;
    if (type) {
      return { ok: false, message: mapAuthError(type) };
    }
    return {
      ok: false,
      message: "Could not send the sign-in email. Please try again.",
    };
  }
}

/**
 * End the current browser session only (FR-003). Other sessions stay active.
 * Redirects to public home per auth-http contract.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/");
}
