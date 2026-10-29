export interface RosterKey {
  readonly owner: string;
  readonly courseId: string;
}

export interface RosterSnapshot extends RosterKey {
  readonly emails: ReadonlyArray<string>;
  readonly savedAt: string;
}

export interface RosterRepo {
  readonly read: (key: RosterKey) => Promise<RosterSnapshot | null>;
  readonly save: (snapshot: RosterSnapshot) => Promise<void>;
}
