import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";

import { SqliteWorkspaceRepo } from "./sqlite-workspace.repo";

it("restores course and snapshot across connections and isolates identities", async () => {
  const directory = mkdtempSync(join(tmpdir(), "workspace-sync-"));
  try { await verifyPersistence(join(directory, "workspace.sqlite")); }
  finally { rmSync(directory, { recursive: true, force: true }); }
});

async function verifyPersistence(path: string) {
  const repo = new SqliteWorkspaceRepo(path);
  const key = { owner: "teacher", spaceId: "spaces/1" };
  const snapshot = { courseId: "1", spaceId: key.spaceId, savedAt: "now", courses: [], students: [], members: [] };
  await repo.select(key, "1");
  await repo.save(key, snapshot);
  expect(await new SqliteWorkspaceRepo(path).read(key)).toEqual({ courseId: "1", snapshot });
  expect(await repo.read({ ...key, owner: "other" })).toEqual({ courseId: "", snapshot: null });
  await repo.select(key, "2");
  expect(await repo.read(key)).toEqual({ courseId: "2", snapshot: null });
}
