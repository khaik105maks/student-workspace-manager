export interface Course { readonly id: string; readonly name: string; readonly section: string; }
export interface Student { readonly id: string; readonly email: string; readonly name: string; }
export interface ChatMember { readonly identity: string; readonly kind: string; readonly status: string; readonly role: string; }
export interface SyncSnapshot {
  readonly courseId: string;
  readonly spaceId: string;
  readonly savedAt: string;
  readonly students: ReadonlyArray<Student>;
  readonly members: ReadonlyArray<ChatMember>;
  readonly invitations?: ReadonlyArray<{ readonly id: string; readonly userId: string; readonly email: string }> | undefined;
  readonly courses: ReadonlyArray<Course>;
}
export interface WorkspaceState {
  readonly courseId: string;
  readonly snapshot: SyncSnapshot | null;
}
export interface StudentMatch {
  readonly email: string;
  readonly userId: string;
  readonly classroom: string;
  readonly chat: string;
}
