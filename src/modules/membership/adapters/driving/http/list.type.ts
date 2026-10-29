import type { MemberKind, MemberRole } from "@/modules/membership/domain/member.value";
import type { MemberStatus } from "@/modules/membership/domain/member-status.value";

export interface MemberView {
  readonly identity: string;
  readonly kind: MemberKind;
  readonly status: MemberStatus;
  readonly role: MemberRole;
}

export interface ListMemberResponse {
  readonly members: ReadonlyArray<MemberView>;
}
