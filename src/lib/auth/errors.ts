/**
 * Map Auth.js / provider error codes to safe user-facing copy (FR-012, FR-013).
 * Never expose tokens, secrets, or stack traces.
 */

const SAFE_MESSAGES: Record<string, string> = {
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  AccessDenied: "Access was denied. Try a different sign-in method.",
  Verification: "That sign-in link is invalid or has expired. Request a new one.",
  OAuthSignin: "Could not start sign-in with the provider. Please try again.",
  OAuthCallback: "Could not complete sign-in with the provider. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  Callback: "Could not complete sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method. Use that method instead.",
  EmailSignin: "Could not send the sign-in email. Check the address and try again.",
  CredentialsSignin: "Sign-in failed. Please try again.",
  SessionRequired: "Please sign in to continue.",
  Default: "Something went wrong during sign-in. Please try again.",
};

export function mapAuthError(errorCode: string | null | undefined): string {
  if (!errorCode) return SAFE_MESSAGES.Default;
  return SAFE_MESSAGES[errorCode] ?? SAFE_MESSAGES.Default;
}
