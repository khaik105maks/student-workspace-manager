const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class StudentEmail {
  private constructor(readonly value: string) {}

  static create(rawValue: string): StudentEmail {
    const normalized = rawValue.trim().replace("\\@", "@").toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) throw new Error(`Invalid student email: ${rawValue}`);
    return new StudentEmail(normalized);
  }
}

export function studentEmails(rawEmails: ReadonlyArray<string>): ReadonlyArray<StudentEmail> {
  return [...new Map(rawEmails.map(studentEmailEntry)).values()];
}

function studentEmailEntry(rawValue: string): readonly [string, StudentEmail] {
  const email = StudentEmail.create(rawValue);
  return [email.value, email];
}
