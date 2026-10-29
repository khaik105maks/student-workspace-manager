import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "zod";

import type { RosterKey, RosterRepo, RosterSnapshot } from "@/modules/classroom/application/ports/roster.repo";

export class SqliteRosterRepo implements RosterRepo {
  constructor(private readonly path: string) {}

  async read(key: RosterKey): Promise<RosterSnapshot | null> {
    const database = this.open();
    try {
      const snapshot = database.prepare("SELECT emails, savedAt FROM roster WHERE owner = ? AND courseId = ?").get(key.owner, key.courseId);
      return snapshot === undefined ? null : decodeSnapshot(snapshot, key);
    } finally { database.close(); }
  }

  async save(snapshot: RosterSnapshot): Promise<void> {
    const database = this.open();
    try { saveSnapshot(database, snapshot); }
    finally { database.close(); }
  }

  private open(): DatabaseSync {
    mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
    const database = new DatabaseSync(this.path);
    database.exec("PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS roster (owner TEXT NOT NULL, courseId TEXT NOT NULL, emails TEXT NOT NULL, savedAt TEXT NOT NULL, PRIMARY KEY (owner, courseId)); CREATE TABLE IF NOT EXISTS roster_audit (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, courseId TEXT NOT NULL, emailCount INTEGER NOT NULL, savedAt TEXT NOT NULL)");
    return database;
  }
}

function saveSnapshot(database: DatabaseSync, snapshot: RosterSnapshot): void {
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare("INSERT INTO roster (owner, courseId, emails, savedAt) VALUES (?, ?, ?, ?) ON CONFLICT(owner, courseId) DO UPDATE SET emails = excluded.emails, savedAt = excluded.savedAt").run(snapshot.owner, snapshot.courseId, JSON.stringify(snapshot.emails), snapshot.savedAt);
    database.prepare("INSERT INTO roster_audit (owner, courseId, emailCount, savedAt) VALUES (?, ?, ?, ?)").run(snapshot.owner, snapshot.courseId, snapshot.emails.length, snapshot.savedAt);
    database.exec("COMMIT");
  } catch (failure: unknown) { database.exec("ROLLBACK"); throw failure; }
}

function decodeSnapshot(snapshot: unknown, key: RosterKey): RosterSnapshot {
  const stored = z.object({ emails: z.string(), savedAt: z.string() }).parse(snapshot);
  return { ...key, savedAt: stored.savedAt, emails: z.array(z.email()).parse(JSON.parse(stored.emails)) };
}
