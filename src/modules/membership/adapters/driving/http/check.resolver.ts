import type { CheckMemberCase } from "@/modules/membership/application/use-cases/check-member.case";
import type { Membership } from "@/modules/membership/domain/membership.value";

import { checkMemberSchema } from "./check.schema";
import type { MembershipView } from "./check.type";

export class CheckMemberResolver {
  constructor(private readonly checkMemberCase: CheckMemberCase) {}

  async resolve(payload: unknown): Promise<ReadonlyArray<MembershipView>> {
    const request = checkMemberSchema.parse(payload);
    const memberships = await this.checkMemberCase.execute(request.spaceId, request.emails);
    return memberships.map(toMembershipView);
  }
}

function toMembershipView(membership: Membership): MembershipView {
  return { email: membership.email.value, status: membership.status };
}
