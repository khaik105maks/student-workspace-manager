import type { InviteStatus } from "@/modules/classroom/domain/invite.value";

export interface InviteRequest {
  readonly courseId: string;
  readonly emails: ReadonlyArray<string>;
}

export interface ExecuteInviteRequest extends InviteRequest {
  readonly isHumanConfirmed: boolean;
}

export interface InviteView {
  readonly email: string;
  readonly status: InviteStatus;
}

export interface InviteResponse {
  readonly invitations: ReadonlyArray<InviteView>;
}
