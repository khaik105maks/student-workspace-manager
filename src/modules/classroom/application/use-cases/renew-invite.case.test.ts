import { expect, it, vi } from "vitest";
import { RenewInviteCase } from "./renew-invite.case";

const command = { actorEmail: "teacher@example.com", courseId: "1", email: "student@example.com", isHumanConfirmed: true };
function fixture() {
  const classroom = { listStudent: vi.fn().mockResolvedValue([]), listCourse: vi.fn(), inviteStudent: vi.fn() };
  const invitations = { list: vi.fn().mockResolvedValue([{ id: "pending", userId: "123", email: command.email }]), remove: vi.fn(), create: vi.fn() };
  const audit = { append: vi.fn() };
  return { classroom, invitations, audit, useCase: new RenewInviteCase({ classroom, invitations, audit, clock: { now: () => "now" } }) };
}

it("requires human confirmation before any operation", async () => {
  const setup = fixture();
  await expect(setup.useCase.execute({ ...command, isHumanConfirmed: false })).rejects.toThrow();
  expect(setup.invitations.remove).not.toHaveBeenCalled();
  expect(setup.invitations.create).not.toHaveBeenCalled();
});
it("skips a student who has already joined", async () => {
  const setup = fixture();
  setup.classroom.listStudent.mockResolvedValue([{ email: command.email }]);
  await expect(setup.useCase.execute(command)).resolves.toBe("already-member");
  expect(setup.invitations.remove).not.toHaveBeenCalled();
  expect(setup.invitations.create).not.toHaveBeenCalled();
});
it("records deletion and creation separately", async () => {
  const setup = fixture();
  await expect(setup.useCase.execute(command)).resolves.toBe("invited");
  expect(setup.invitations.remove).toHaveBeenCalledWith("pending");
  expect(setup.invitations.create).toHaveBeenCalledWith("1", command.email);
  expect(setup.audit.append.mock.calls.map((call) => call[0].action)).toEqual(["invite-renew-started", "invite-deleted", "invite-created"]);
});
it("reports partial failure when creation fails after deletion", async () => {
  const setup = fixture();
  setup.invitations.create.mockRejectedValue(new Error("unavailable"));
  await expect(setup.useCase.execute(command)).resolves.toBe("failed");
  expect(setup.audit.append).toHaveBeenLastCalledWith(expect.objectContaining({ action: "invite-create-failed" }));
});
it("does not delete when the initial audit fails", async () => {
  const setup = fixture();
  setup.audit.append.mockRejectedValue(new Error("disk full"));
  await expect(setup.useCase.execute(command)).rejects.toThrow();
  expect(setup.invitations.remove).not.toHaveBeenCalled();
});
it("does not create after a failed delete", async () => {
  const setup = fixture();
  setup.invitations.remove.mockRejectedValue(new Error("forbidden"));
  await expect(setup.useCase.execute(command)).rejects.toThrow();
  expect(setup.invitations.create).not.toHaveBeenCalled();
});
