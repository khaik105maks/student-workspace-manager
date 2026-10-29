import type { Member } from "@/modules/membership/domain/member.value";

import type { MembershipService } from "../ports/membership.service";

export class ListMemberCase {
  constructor(private readonly membershipService: MembershipService) {}

  execute(spaceId: string): Promise<ReadonlyArray<Member>> {
    return this.membershipService.list(spaceId);
  }
}
