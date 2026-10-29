import type { InviteStudentCase } from "@/modules/classroom/application/use-cases/invite-student.case";
import type { Invite } from "@/modules/classroom/domain/invite.value";

import { executeInviteSchema } from "./invite.schema";
import type { InviteView } from "./invite.type";

export class InviteStudentResolver {
  constructor(private readonly inviteStudentCase: InviteStudentCase) {}

  async resolve(payload: unknown, actorEmail: string): Promise<ReadonlyArray<InviteView>> {
    const request = executeInviteSchema.parse(payload);
    const invitations = await this.inviteStudentCase.execute({ ...request, actorEmail, rawEmails: request.emails });
    return invitations.map(toInviteView);
  }
}

function toInviteView(invite: Invite): InviteView {
  return { email: invite.email.value, status: invite.status };
}
