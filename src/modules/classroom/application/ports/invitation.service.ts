export interface PendingInvitation { readonly id: string; readonly userId: string; readonly email: string; }
export interface InvitationService {
  readonly list: (courseId: string, email?: string) => Promise<ReadonlyArray<PendingInvitation>>;
  readonly remove: (id: string) => Promise<void>;
  readonly create: (courseId: string, email: string) => Promise<void>;
}
