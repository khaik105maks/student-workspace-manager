import { describe, expect, it, vi } from "vitest";

import type { MembershipService } from "../ports/membership.service";
import { ListMemberCase } from "./list-member.case";

describe("ListMemberCase", () => {
  it("lists members from the requested space", async () => {
    const list = vi.fn().mockResolvedValue([]);
    const membershipService: MembershipService = { list, check: vi.fn(), add: vi.fn() };

    await new ListMemberCase(membershipService).execute("spaces/course");

    expect(list).toHaveBeenCalledWith("spaces/course");
  });
});
