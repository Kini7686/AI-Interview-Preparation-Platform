/**
 * Normalize email for uniqueness and account linking (FR-004).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
