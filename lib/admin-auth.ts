/**
 * Admin authentication utilities.
 * Centralizes the admin passkey retrieval across all admin routes.
 */
export function getAdminPasskey(): string {
  return process.env.ADMIN_PASSKEY || 'Badman256';
}

export function verifyAdminPasskey(passkey: string | null | undefined): boolean {
  if (!passkey || typeof passkey !== 'string') return false;
  return passkey.trim() === getAdminPasskey();
}
