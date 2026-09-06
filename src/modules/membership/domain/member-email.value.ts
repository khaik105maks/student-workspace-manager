const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class MemberEmail {
  private constructor(readonly value: string) {}

  static create(rawValue: string): MemberEmail {
    const normalized = normalizeEmail(rawValue);
    requireValidEmail(normalized, rawValue);
    return new MemberEmail(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export function memberEmail(rawValue: string): MemberEmail {
  return MemberEmail.create(rawValue);
}

export function memberEmails(rawEmails: ReadonlyArray<string>): ReadonlyArray<MemberEmail> {
  return Object.freeze([...new Map(rawEmails.map(memberEmailEntry)).values()]);
}

function memberEmailEntry(rawValue: string): readonly [string, MemberEmail] {
  const email = memberEmail(rawValue);
  return [email.value, email];
}

function normalizeEmail(rawValue: string): string {
  return rawValue.trim().replace("\\@", "@").toLowerCase();
}

function requireValidEmail(normalized: string, rawValue: string): void {
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error(`Invalid member email: ${rawValue}`);
  }
}
