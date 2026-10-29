import { expect, it, vi } from "vitest";
import { GoogleInvitationService } from "./invitation.service";

it("paginates student invitations and resolves email profiles", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ invitations: [{ id: "i1", userId: "123", courseId: "1", role: "STUDENT" }], nextPageToken: "next" }))
    .mockResolvedValueOnce(Response.json({ emailAddress: "student@example.com" }))
    .mockResolvedValueOnce(Response.json({ invitations: [{ id: "i2", userId: "456", courseId: "1", role: "TEACHER" }] }));
  const service = new GoogleInvitationService("token", fetcher);
  await expect(service.list("1", "student@example.com")).resolves.toEqual([{ id: "i1", userId: "123", email: "student@example.com" }]);
  expect(fetcher.mock.calls[2]?.[0]).toContain("pageToken=next");
  expect(fetcher.mock.calls[2]?.[0]).toContain("userId=student%40example.com");
});

it("uses DELETE and POST without requiring JSON from an empty delete response", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  const service = new GoogleInvitationService("token", fetcher);
  await service.remove("i1");
  await service.create("1", "student@example.com");
  expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ method: "DELETE" });
  expect(fetcher.mock.calls[1]?.[1]).toMatchObject({ method: "POST", body: JSON.stringify({ courseId: "1", userId: "student@example.com", role: "STUDENT" }) });
});
