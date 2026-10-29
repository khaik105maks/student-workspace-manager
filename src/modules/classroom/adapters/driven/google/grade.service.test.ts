import { describe, expect, it, vi } from "vitest";
import { GoogleGradeService } from "./grade.service";

describe("GoogleGradeService", () => {
  it("reads every assignment page and keeps zero maximum points", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ courseWork: [{ id: "a", title: "Lab", maxPoints: 0, dueDate: { year: 2026, month: 9, day: 10 } }], nextPageToken: "next" })).mockResolvedValueOnce(Response.json({ courseWork: [{ id: "b", title: "Lab 2" }] }));
    const assignments = await new GoogleGradeService("token", fetcher).assignments("course");
    expect(assignments).toHaveLength(2);
    expect(assignments[0]).toMatchObject({ maxPoints: 0, deadline: "2026-09-10T00:00:00.000Z" });
    expect(assignments[1]?.maxPoints).toBeNull();
    expect(String(fetcher.mock.calls[1]?.[0])).toContain("pageToken=next");
  }); it("reads all submissions, distinguishing zero, missing and draft grades", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ studentSubmissions: [{ courseWorkId: "a", userId: "1", assignedGrade: 0, late: true }], nextPageToken: "next" })).mockResolvedValueOnce(Response.json({ studentSubmissions: [{ courseWorkId: "a", userId: "2", draftGrade: 5 }], nextPageToken: "" }));
    const submissions = await new GoogleGradeService("token", fetcher).submissions("course");
    expect(submissions[0]).toMatchObject({ grade: 0, draftGrade: null, isLate: true });
    expect(submissions[1]).toMatchObject({ grade: null, draftGrade: 5 });
    expect(String(fetcher.mock.calls[1]?.[0])).toContain("courseWork/-/studentSubmissions");
  }); it("rejects partial reads when a later page is forbidden", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ nextPageToken: "next" })).mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(new GoogleGradeService("token", fetcher).assignments("course")).rejects.toMatchObject({ statusCode: 403 });
  }); it("accepts empty lists and rejects unsafe links", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(Response.json({ courseWork: [{ id: "a", title: "Lab", alternateLink: "javascript:alert(1)" }] }));
    const service = new GoogleGradeService("token", fetcher);
    expect(await service.submissions("course")).toEqual([]);
    await expect(service.assignments("course")).rejects.toThrow();
  });
});
