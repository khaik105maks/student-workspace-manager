import type { MemberEmail } from "./member-email.value";
import type { MemberStatus } from "./member-status.value";

export interface Membership {
  readonly email: MemberEmail;
  readonly status: MemberStatus;
}
