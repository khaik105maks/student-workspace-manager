import type { Membership } from "@/modules/membership/domain/membership.value";

export interface AuditEntry {
  readonly action: "member-add";
  readonly actorEmail: string;
  readonly spaceId: string;
  readonly memberships: ReadonlyArray<Membership>;
  readonly occurredAt: string;
}

export interface AuditRepo {
  readonly append: (entry: AuditEntry) => Promise<void>;
}
