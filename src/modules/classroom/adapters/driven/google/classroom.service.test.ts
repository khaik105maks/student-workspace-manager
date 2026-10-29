import { describe, expect, it, vi } from "vitest";

import { GoogleClassroomService } from "./classroom.service";

describe("GoogleClassroomService", () => {
  it("lists active courses taught by the authenticated user", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      courses: [{ id: "course-1", name: "Software Architecture", section: "K-105" }],
    }));

    await expect(new GoogleClassroomService("token", fetcher).listCourse()).resolves.toEqual([
      { id: "course-1", name: "Software Architecture", section: "K-105" },
    ]);
    expect(fetcher.mock.calls[0]?.[0]).toContain("teacherId=me");
  });

  it("returns student ids, names, and emails", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ students: [googleStudent()] }));

    await expect(new GoogleClassroomService("token", fetcher).listStudent("course-1")).resolves.toEqual([
      { id: "123", email: "student@student.khai.edu", name: "Student Name" },
    ]);
  });
});

function googleStudent() {
  return {
    profile: {
      id: "123",
      emailAddress: "student@student.khai.edu",
      name: { fullName: "Student Name" },
    },
  };
}
