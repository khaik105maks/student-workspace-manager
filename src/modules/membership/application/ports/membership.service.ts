import type { MemberEmail } from "../../domain/member-email.value";
import type { Membership } from "../../domain/membership.value";

export interface MembershipService {
  readonly check: (
    spaceId: string,
    emails: ReadonlyArray<MemberEmail>,
  ) => Promise<ReadonlyArray<Membership>>;
  readonly add: (
    spaceId: string,
    emails: ReadonlyArray<MemberEmail>,
  ) => Promise<ReadonlyArray<Membership>>;
}
