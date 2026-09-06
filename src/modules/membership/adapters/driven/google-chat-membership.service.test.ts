import { describe, expect, it, vi } from "vitest";

import { memberEmail } from "../../domain/member-email.value";
import { GoogleChatMembershipService } from "./google-chat-membership.service";

const loggerService = { info: vi.fn(), error: vi.fn() };

describe("GoogleChatMembershipService", () => {
  it("maps a Google membership to the domain", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ memberships: [{ state: "JOINED" }] }));
    const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
    const email = memberEmail("student@student.khai.edu");

    await expect(service.check("spaces/course", [email])).resolves.toEqual([
      { email, status: "joined" },
    ]);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("maps an empty response to not-member", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({}));
    const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
    const email = memberEmail("missing@student.khai.edu");

    await expect(service.check("spaces/course", [email])).resolves.toEqual([
      { email, status: "not-member" },
    ]);
  });
});
