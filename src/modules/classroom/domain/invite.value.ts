import type { StudentEmail } from "./student-email.value";

export type InviteStatus = "ready" | "already-member" | "invited" | "already-invited" | "failed";

export interface Invite {
  readonly email: StudentEmail;
  readonly status: InviteStatus;
}
