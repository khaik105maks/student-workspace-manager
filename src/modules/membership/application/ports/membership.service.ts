import type { MemberEmail } from "@/modules/membership/domain/member-email.value";
import type { Member } from "@/modules/membership/domain/member.value";
import type { Membership } from "@/modules/membership/domain/membership.value";

export interface MembershipService {
  readonly list: (spaceId: string) => Promise<ReadonlyArray<Member>>;
  readonly check: (
    spaceId: string,
    emails: ReadonlyArray<MemberEmail>,
  ) => Promise<ReadonlyArray<Membership>>;
  readonly add: (
    spaceId: string,
    emails: ReadonlyArray<MemberEmail>,
  ) => Promise<ReadonlyArray<Membership>>;
}
