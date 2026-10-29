export interface GoogleUser {
  readonly name?: string | undefined;
  readonly type?: string | undefined;
}

export interface GoogleGroup {
  readonly name?: string | undefined;
}

export interface GoogleMembership {
  readonly state?: string | undefined;
  readonly role?: string | undefined;
  readonly member?: GoogleUser | undefined;
  readonly groupMember?: GoogleGroup | undefined;
}

export interface GoogleMembershipList {
  readonly memberships: ReadonlyArray<GoogleMembership>;
  readonly nextPageToken?: string | undefined;
}
