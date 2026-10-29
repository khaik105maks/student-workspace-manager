import { describe, expect, it, vi } from "vitest";

import { memberEmail } from "@/modules/membership/domain/member-email.value";
import { GoogleChatMembershipService } from "./google-chat-membership.service";

const loggerService = { info: vi.fn(), error: vi.fn() };

describe("GoogleChatMembershipService", () => {
  it("maps a Google membership to the domain", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(Response.json({ state: "JOINED" }));
    const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
    const email = memberEmail("student@student.khai.edu");

    await expect(service.check("spaces/course", [email])).resolves.toEqual([
      { email, status: "joined" },
    ]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1]?.[0]).toBe("https://chat.googleapis.com/v1/spaces/course/members/student%40student.khai.edu");
  });

  it("maps a missing membership to not-member after verifying space access", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(new Response(null, { status: 404 }));
    const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
    const email = memberEmail("missing@student.khai.edu");

    await expect(service.check("spaces/course", [email])).resolves.toEqual([
      { email, status: "not-member" },
    ]);
  });

  it("lists and maps every paginated membership", listsPaginatedMemberships);
});

async function listsPaginatedMemberships() {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(Response.json(firstMemberPage()))
    .mockResolvedValueOnce(Response.json(secondMemberPage()));
  const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);

  await expect(service.list("spaces/course")).resolves.toEqual([
    { identity: "users/123", kind: "human", status: "joined", role: "member" },
    { identity: "groups/456", kind: "group", status: "invited", role: "manager" },
  ]);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[1]?.[0]).toContain("pageToken=next-page");
}

function firstMemberPage() {
  return {
    memberships: [{ member: { name: "users/123", type: "HUMAN" }, state: "JOINED", role: "ROLE_MEMBER" }],
    nextPageToken: "next-page",
  };
}

function secondMemberPage() {
  return {
    memberships: [{ groupMember: { name: "groups/456" }, state: "INVITED", role: "ROLE_MANAGER" }],
  };
}

it.each([401, 403, 404, 429, 500])("does not interpret a space error %s as an absent member", async (status) => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status }));
  const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
  await expect(service.check("spaces/course", [memberEmail("student@example.com")])).rejects.toThrow(`status ${status}`);
  expect(fetcher).toHaveBeenCalledOnce();
});

it.each([401, 403, 429, 500])("preserves membership lookup failure %s", async (status) => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(new Response(null, { status }));
  const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
  await expect(service.check("spaces/course", [memberEmail("student@example.com")])).rejects.toThrow(`status ${status}`);
});

it.each(["INVITED", "UNRECOGNIZED"])("handles member state %s", async (state) => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(Response.json({ state }));
  const service = new GoogleChatMembershipService("access-token", loggerService, fetcher);
  const email = memberEmail("student@example.com");
  await expect(service.check("spaces/course", [email])).resolves.toEqual([{ email, status: state === "INVITED" ? "invited" : "unknown" }]);
});
