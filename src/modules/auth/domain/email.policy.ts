const ALLOWED_EMAIL_SUFFIX = "@khai.edu";

export function isAllowedEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase().endsWith(ALLOWED_EMAIL_SUFFIX) ?? false;
}
