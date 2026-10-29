import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { WorkspaceKey, WorkspaceRepo } from "@/modules/workspace/application/ports/workspace.repo";
import type { SyncSnapshot, WorkspaceState } from "@/modules/workspace/domain/sync.value";
import { workspaceStateSchema } from "@/modules/workspace/adapters/driving/http/workspace.schema";

export class SqliteWorkspaceRepo implements WorkspaceRepo {
  constructor(private readonly path: string) {}

  async read(key: WorkspaceKey): Promise<WorkspaceState> {
    const database = this.open();
    try { return readState(database, key); }
    finally { database.close(); }
  }

  async select(key: WorkspaceKey, courseId: string): Promise<void> {
    const database = this.open();
    try { transact(database, () => {
      database.prepare("INSERT INTO workspace_selection VALUES (?, ?, ?) ON CONFLICT(owner, space) DO UPDATE SET course = excluded.course").run(key.owner, key.spaceId, courseId);
      audit(database, key, `select:${courseId}`);
    }); } finally { database.close(); }
  }

  async save(key: WorkspaceKey, snapshot: SyncSnapshot): Promise<void> {
    const database = this.open();
    try { transact(database, () => {
      database.prepare("INSERT INTO workspace_snapshot VALUES (?, ?, ?, ?) ON CONFLICT(owner, space, course) DO UPDATE SET payload = excluded.payload").run(key.owner, key.spaceId, snapshot.courseId, JSON.stringify(snapshot));
      audit(database, key, `sync:${snapshot.courseId}`);
    }); } finally { database.close(); }
  }

  private open(): DatabaseSync {
    mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
    const database = new DatabaseSync(this.path);
    database.exec("PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS workspace_selection(owner TEXT, space TEXT, course TEXT, PRIMARY KEY(owner, space)); CREATE TABLE IF NOT EXISTS workspace_snapshot(owner TEXT, space TEXT, course TEXT, payload TEXT, PRIMARY KEY(owner, space, course)); CREATE TABLE IF NOT EXISTS workspace_audit(id INTEGER PRIMARY KEY, owner TEXT, space TEXT, action TEXT, saved_at TEXT DEFAULT CURRENT_TIMESTAMP)");
    return database;
  }
}

function readState(database: DatabaseSync, key: WorkspaceKey): WorkspaceState {
  const selection = database.prepare("SELECT course FROM workspace_selection WHERE owner=? AND space=?").get(key.owner, key.spaceId);
  const courseId = String(selection?.["course"] ?? "");
  const saved = database.prepare("SELECT payload FROM workspace_snapshot WHERE owner=? AND space=? AND course=?").get(key.owner, key.spaceId, courseId);
  const snapshot: unknown = saved ? JSON.parse(String(saved["payload"])) : null;
  return workspaceStateSchema.parse({ courseId, snapshot });
}

function transact(database: DatabaseSync, operation: () => void) {
  database.exec("BEGIN IMMEDIATE");
  try { operation(); database.exec("COMMIT"); }
  catch (failure: unknown) { database.exec("ROLLBACK"); throw failure; }
}

function audit(database: DatabaseSync, key: WorkspaceKey, action: string) {
  database.prepare("INSERT INTO workspace_audit(owner, space, action) VALUES (?, ?, ?)").run(key.owner, key.spaceId, action);
}
