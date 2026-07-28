/**
 * Validate post-login callback URLs (FR-007).
 * Only same-origin relative paths under private prefixes are allowed.
 */

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/history",
  "/interview",
] as const;

export function isAllowedCallbackUrl(callbackUrl: string | null | undefined): boolean {
  if (!callbackUrl) return false;
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return false;
  if (callbackUrl.includes("://")) return false;
  return PRIVATE_PREFIXES.some(
    (prefix) => callbackUrl === prefix || callbackUrl.startsWith(`${prefix}/`),
  );
}

export function resolveCallbackUrl(
  callbackUrl: string | null | undefined,
  fallback = "/dashboard",
): string {
  return isAllowedCallbackUrl(callbackUrl) ? (callbackUrl as string) : fallback;
}

export { PRIVATE_PREFIXES };
