import { expect, it, vi } from "vitest";

import { ImportRosterCase } from "./import-roster.case";

function fixture() {
  const save = vi.fn().mockResolvedValue(undefined);
  const read = vi.fn().mockResolvedValue(null);
  return { save, read, useCase: new ImportRosterCase({ save, read }, { now: () => "2026-09-07T12:00:00Z" }) };
}

it("saves a manual list without a Google course and deduplicates emails", async () => {
  const setup = fixture();
  const roster = await setup.useCase.execute("teacher", [" A@example.com ", "a@example.com"], true);
  expect(roster.emails).toEqual(["a@example.com"]);
  expect(setup.save).toHaveBeenCalledWith(roster);
  await setup.useCase.read("teacher");
  expect(setup.read).toHaveBeenCalledWith({ owner: "teacher", courseId: "local:student-list" });
});

it("rejects unconfirmed, invalid and empty imports without replacing the list", async () => {
  const setup = fixture();
  await expect(setup.useCase.execute("teacher", ["a@example.com"], false)).rejects.toThrow();
  await expect(setup.useCase.execute("teacher", ["invalid"], true)).rejects.toThrow();
  await expect(setup.useCase.execute("teacher", [], true)).rejects.toThrow();
  expect(setup.save).not.toHaveBeenCalled();
});
