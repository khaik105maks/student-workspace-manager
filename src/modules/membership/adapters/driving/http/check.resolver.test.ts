import { describe, expect, it, vi } from "vitest";

import { CheckMemberCase } from "@/modules/membership/application/use-cases/check-member.case";
import { memberEmail } from "@/modules/membership/domain/member-email.value";

import { CheckMemberResolver } from "./check.resolver";

describe("CheckMemberResolver", () => {
  it("maps memberships to transport views", async () => {
    const email = memberEmail("student@student.khai.edu");
    const check = vi.fn().mockResolvedValue([{ email, status: "joined" }]);
    const resolver = new CheckMemberResolver(new CheckMemberCase({ check, add: vi.fn() }));

    await expect(
      resolver.resolve({ spaceId: "spaces/course", emails: [email.value] }),
    ).resolves.toEqual([{ email: email.value, status: "joined" }]);
  });

  it("rejects an invalid transport request", async () => {
    const resolver = new CheckMemberResolver(
      new CheckMemberCase({ check: vi.fn(), add: vi.fn() }),
    );

    await expect(resolver.resolve({ spaceId: "course", emails: [] })).rejects.toThrow();
  });
});
