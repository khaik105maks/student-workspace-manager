import { memberEmails } from "@/modules/membership/domain/member-email.value";
import type { Membership } from "@/modules/membership/domain/membership.value";
import type { MembershipService } from "../ports/membership.service";

export class CheckMemberCase {
  constructor(private readonly membershipService: MembershipService) {}

  execute(
    spaceId: string,
    rawEmails: ReadonlyArray<string>,
  ): Promise<ReadonlyArray<Membership>> {
    return this.membershipService.check(spaceId, memberEmails(rawEmails));
  }
}
