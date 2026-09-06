import { memberEmails } from "../../domain/member-email.value";
import type { Membership } from "../../domain/membership.value";
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
