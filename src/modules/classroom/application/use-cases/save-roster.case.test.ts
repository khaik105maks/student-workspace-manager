import { expect, it, vi } from "vitest";

import { SaveRosterCase } from "./save-roster.case";

function setup() {
  const listStudent = vi.fn().mockResolvedValue([{ email: " Student@Example.com " }, { email: "student@example.com" }]);
  const save = vi.fn().mockResolvedValue(undefined);
  const classroom = { listStudent, listCourse: vi.fn(), inviteStudent: vi.fn() };
  const repo = { save, read: vi.fn() };
  return { listStudent, save, useCase: new SaveRosterCase(classroom, repo, { now: () => "2026-09-07T12:00:00Z" }) };
}

it("requires confirmation before reading or saving the roster", async () => {
  const fixture = setup();
  await expect(fixture.useCase.execute({ owner: "teacher", courseId: "1" }, false)).rejects.toThrow("confirmation");
  expect(fixture.listStudent).not.toHaveBeenCalled();
  expect(fixture.save).not.toHaveBeenCalled();
});

it("normalizes and deduplicates addresses", async () => {
  const fixture = setup();
  const snapshot = await fixture.useCase.execute({ owner: "teacher", courseId: "1" }, true);
  expect(snapshot.emails).toEqual(["student@example.com"]);
  expect(fixture.save).toHaveBeenCalledWith(snapshot);
});

it("preserves the saved roster when Classroom fails", async () => {
  const fixture = setup();
  fixture.listStudent.mockRejectedValue(new Error("Unavailable"));
  await expect(fixture.useCase.execute({ owner: "teacher", courseId: "1" }, true)).rejects.toThrow("Unavailable");
  expect(fixture.save).not.toHaveBeenCalled();
});
