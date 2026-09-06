import { requireHumanConfirmation } from "@/modules/membership/domain/confirmation.policy";
import { memberEmails } from "@/modules/membership/domain/member-email.value";
import type { Membership } from "@/modules/membership/domain/membership.value";
import type { AuditRepo } from "../ports/audit.repo";
import type { ClockService } from "../ports/clock.service";
import type { MembershipService } from "../ports/membership.service";

export interface AddMemberCommand {
  readonly actorEmail: string;
  readonly spaceId: string;
  readonly rawEmails: ReadonlyArray<string>;
  readonly isHumanConfirmed: boolean;
}

export class AddMemberCase {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly auditRepo: AuditRepo,
    private readonly clockService: ClockService,
  ) {}

  async execute(command: AddMemberCommand): Promise<ReadonlyArray<Membership>> {
    requireHumanConfirmation(command.isHumanConfirmed);
    const emails = memberEmails(command.rawEmails);
    const addedMemberships = await this.membershipService.add(command.spaceId, emails);
    await this.auditRepo.append({
      action: "member-add",
      actorEmail: command.actorEmail,
      spaceId: command.spaceId,
      memberships: addedMemberships,
      occurredAt: this.clockService.now(),
    });

    return addedMemberships;
  }
}
