import type { Invite } from "@/modules/classroom/domain/invite.value";

export interface InviteAuditEntry {
  readonly action: "student-invite" | "invite-renew-started" | "invite-deleted" | "invite-created" | "invite-create-failed";
  readonly actorEmail: string;
  readonly courseId: string;
  readonly invitations: ReadonlyArray<Invite>;
  readonly occurredAt: string;
}

export interface InviteAuditRepo {
  readonly append: (entry: InviteAuditEntry) => Promise<void>;
}
