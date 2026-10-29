import type { PreviewInviteCase } from "@/modules/classroom/application/use-cases/preview-invite.case";
import type { Invite } from "@/modules/classroom/domain/invite.value";

import { inviteRequestSchema } from "./invite.schema";
import type { InviteView } from "./invite.type";

export class PreviewInviteResolver {
  constructor(private readonly previewInviteCase: PreviewInviteCase) {}

  async resolve(payload: unknown): Promise<ReadonlyArray<InviteView>> {
    const request = inviteRequestSchema.parse(payload);
    const invitations = await this.previewInviteCase.execute(request.courseId, request.emails);
    return invitations.map(toInviteView);
  }
}

function toInviteView(invite: Invite): InviteView {
  return { email: invite.email.value, status: invite.status };
}
