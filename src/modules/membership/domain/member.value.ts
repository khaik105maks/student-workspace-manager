import type { MemberStatus } from "./member-status.value";

export type MemberKind = "human" | "bot" | "group" | "unknown";
export type MemberRole = "member" | "manager" | "unknown";

export interface Member {
  readonly identity: string;
  readonly kind: MemberKind;
  readonly status: MemberStatus;
  readonly role: MemberRole;
}
