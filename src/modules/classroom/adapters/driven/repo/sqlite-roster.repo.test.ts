import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";

import { SqliteRosterRepo } from "./sqlite-roster.repo";

const directory = mkdtempSync(join(tmpdir(), "classroom-roster-"));
const path = join(directory, "classroom.sqlite");
const snapshot = { owner: "teacher@example.com", courseId: "course-1", emails: ["student@example.com"], savedAt: "2026-09-07T12:00:00Z" };
afterEach(() => rmSync(directory, { recursive: true, force: true }));

describe("SqliteRosterRepo", () => {
  it("persists a replacement across connections and isolates courses and owners", async () => {
    await new SqliteRosterRepo(path).save(snapshot);
    const repo = new SqliteRosterRepo(path);
    expect(await repo.read(snapshot)).toEqual(snapshot);
    expect(await repo.read({ ...snapshot, owner: "other@example.com" })).toBeNull();
    expect(await repo.read({ ...snapshot, courseId: "course-2" })).toBeNull();
    await repo.save({ ...snapshot, emails: [] });
    expect(await repo.read(snapshot)).toEqual({ ...snapshot, emails: [] });
    const database = new DatabaseSync(path);
    expect(database.prepare("SELECT COUNT(*) AS count FROM roster_audit").get()?.["count"]).toBe(2);
    database.close();
  });

  it("rolls back roster replacement if the audit cannot be recorded", async () => {
    const repo = new SqliteRosterRepo(path);
    await repo.save(snapshot);
    const database = new DatabaseSync(path);
    database.exec("CREATE TRIGGER reject_audit BEFORE INSERT ON roster_audit BEGIN SELECT RAISE(ABORT, 'audit unavailable'); END");
    database.close();
    await expect(repo.save({ ...snapshot, emails: [] })).rejects.toThrow();
    expect(await repo.read(snapshot)).toEqual(snapshot);
  });
});
