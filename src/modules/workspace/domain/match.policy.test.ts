import { expect, it } from "vitest";

import { matchStudents } from "./match.policy";
import type { SyncSnapshot } from "./sync.value";

const snapshot: SyncSnapshot = {
  courseId: "1", spaceId: "spaces/1", savedAt: "now", courses: [],
  students: [{ id: "123", email: "A@example.com", name: "A" }, { id: "456", email: "b@example.com", name: "B" }],
  members: [{ identity: "users/123", kind: "human", status: "joined", role: "member" }],
};

it("joins Google IDs before matching local emails and preserves uncertainty", () => {
  expect(matchStudents(["a@example.com", "b@example.com", "c@example.com"], snapshot)).toEqual([
    { email: "a@example.com", userId: "123", classroom: "Є", chat: "Є" },
    { email: "b@example.com", userId: "456", classroom: "Є", chat: "Немає" },
    { email: "c@example.com", userId: "", classroom: "Немає", chat: "Не вдалося зіставити" },
  ]);
});

it("shows pending Classroom invitations without treating them as enrolled students", () => {
  const pending = { ...snapshot, invitations: [{ id: "i", userId: "789", email: "c@example.com" }] };
  expect(matchStudents(["c@example.com"], pending)[0]?.classroom).toBe("Запрошено");
});
