import { describe, expect, it, vi } from "vitest";

import { memberEmail } from "../../domain/member-email.value";
import type { Membership } from "../../domain/membership.value";
import type { AuditRepo } from "../ports/audit.repo";
import type { ClockService } from "../ports/clock.service";
import type { MembershipService } from "../ports/membership.service";
import { AddMemberCase, type AddMemberCommand } from "./add-member.case";

describe("AddMemberCase", () => {
  it("rejects every write without explicit human confirmation", rejectsUnconfirmedWrite);
  it("adds normalized members and audits the actual result", addsAndAuditsResult);
});

async function rejectsUnconfirmedWrite() {
  const membershipService: MembershipService = { check: vi.fn(), add: vi.fn() };
  const auditRepo: AuditRepo = { append: vi.fn() };
  const clockService: ClockService = { now: vi.fn() };
  const useCase = new AddMemberCase(membershipService, auditRepo, clockService);

  await expect(useCase.execute(unconfirmedCommand())).rejects.toThrow(
    "Human confirmation is required",
  );
  expect(membershipService.add).not.toHaveBeenCalled();
  expect(auditRepo.append).not.toHaveBeenCalled();
}

async function addsAndAuditsResult() {
  const addedMemberships: ReadonlyArray<Membership> = [
    { email: memberEmail("one@student.khai.edu"), status: "joined" },
  ];
  const add = vi.fn().mockResolvedValue(addedMemberships);
  const append = vi.fn().mockResolvedValue(undefined);
  const useCase = new AddMemberCase(
    { check: vi.fn(), add },
    { append },
    { now: () => "2026-09-06T09:00:00.000Z" },
  );

  await useCase.execute(confirmedCommand());
  expect(add).toHaveBeenCalledWith("spaces/course", [memberEmail("one@student.khai.edu")]);
  expect(append).toHaveBeenCalledWith(expectedAudit(addedMemberships));
}

function confirmedCommand(): AddMemberCommand {
  return {
    actorEmail: "teacher@khai.edu",
    spaceId: "spaces/course",
    rawEmails: [" ONE@student.khai.edu ", "one@student.khai.edu"],
    isHumanConfirmed: true,
  };
}

function unconfirmedCommand(): AddMemberCommand {
  return {
    ...confirmedCommand(),
    isHumanConfirmed: false,
  };
}

function expectedAudit(memberships: ReadonlyArray<Membership>) {
  return {
    action: "member-add",
    actorEmail: "teacher@khai.edu",
    spaceId: "spaces/course",
    memberships,
    occurredAt: "2026-09-06T09:00:00.000Z",
  };
}
