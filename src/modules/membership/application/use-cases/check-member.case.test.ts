import { describe, expect, it, vi } from "vitest";

import { memberEmail } from "../../domain/member-email.value";
import type { MembershipService } from "../ports/membership.service";
import { CheckMemberCase } from "./check-member.case";

describe("CheckMemberCase", () => {
  it("checks each normalized email once", async () => {
    const check = vi.fn().mockResolvedValue([]);
    const membershipService: MembershipService = { check, add: vi.fn() };
    const useCase = new CheckMemberCase(membershipService);

    await useCase.execute("spaces/course", [
      " Student@student.khai.edu ",
      "student@student.khai.edu",
    ]);

    expect(check).toHaveBeenCalledWith("spaces/course", [
      memberEmail("student@student.khai.edu"),
    ]);
  });
});
