export interface CheckMemberRequest {
  readonly spaceId: string;
  readonly emails: ReadonlyArray<string>;
}

export interface MembershipView {
  readonly email: string;
  readonly status: string;
}
