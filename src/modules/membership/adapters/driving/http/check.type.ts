export interface CheckMemberRequest {
  readonly emails: ReadonlyArray<string>;
}

export interface MembershipView {
  readonly email: string;
  readonly status: MemberStatus;
}

export interface CheckMemberResponse {
  readonly memberships: ReadonlyArray<MembershipView>;
}
import type { MemberStatus } from "@/modules/membership/domain/member-status.value";
