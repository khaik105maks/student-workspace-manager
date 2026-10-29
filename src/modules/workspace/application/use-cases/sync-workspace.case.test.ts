import { expect, it, vi } from "vitest";

import { SyncWorkspaceCase } from "./sync-workspace.case";

function fixture() {
  const repo = { read: vi.fn().mockResolvedValue({ courseId: "1", snapshot: null }), save: vi.fn(), select: vi.fn() };
  const source = { courses: vi.fn().mockResolvedValue([]), students: vi.fn().mockResolvedValue([]), members: vi.fn().mockResolvedValue([]), invitations: vi.fn().mockResolvedValue([]), now: () => "now" };
  return { repo, source, useCase: new SyncWorkspaceCase(repo, source) };
}
const key = { owner: "teacher", spaceId: "spaces/1" };

it("requires confirmation before sync or selection", async () => {
  const setup = fixture();
  await expect(setup.useCase.execute(key, false)).rejects.toThrow();
  await expect(setup.useCase.select(key, "2", false)).rejects.toThrow();
  expect(setup.repo.save).not.toHaveBeenCalled();
  expect(setup.repo.select).not.toHaveBeenCalled();
  expect(setup.source.members).not.toHaveBeenCalled();
});

it("preserves the prior snapshot if a service fails", async () => {
  const setup = fixture();
  setup.source.members.mockRejectedValue(new Error("Chat unavailable"));
  await expect(setup.useCase.execute(key, true)).rejects.toThrow();
  expect(setup.repo.save).not.toHaveBeenCalled();
});

it("stores both complete lists with course and space identity", async () => {
  const setup = fixture();
  await setup.useCase.execute(key, true);
  expect(setup.source.students).toHaveBeenCalledWith("1");
  expect(setup.source.members).toHaveBeenCalledWith("spaces/1");
  expect(setup.repo.save).toHaveBeenCalledWith(key, { courseId: "1", spaceId: "spaces/1", savedAt: "now", courses: [], students: [], members: [], invitations: [] });
});
