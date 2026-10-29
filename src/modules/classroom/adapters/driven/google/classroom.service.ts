import type { ClassroomService } from "@/modules/classroom/application/ports/classroom.service";
import type { Course } from "@/modules/classroom/domain/course.value";
import type { Student } from "@/modules/classroom/domain/student.value";
import type { Invite } from "@/modules/classroom/domain/invite.value";
import type { StudentEmail } from "@/modules/classroom/domain/student-email.value";

import { googleCourseListSchema, googleInvitationSchema, googleStudentListSchema } from "./classroom.schema";
import type { GoogleCourse, GoogleStudent } from "./classroom.type";

export class GoogleClassroomService implements ClassroomService {
  constructor(
    private readonly accessToken: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  listCourse(): Promise<ReadonlyArray<Course>> {
    return this.listCoursePage();
  }

  listStudent(courseId: string): Promise<ReadonlyArray<Student>> {
    return this.listStudentPage(courseId);
  }

  inviteStudent(courseId: string, emails: ReadonlyArray<StudentEmail>): Promise<ReadonlyArray<Invite>> {
    return Promise.all(emails.map((email) => this.inviteOne(courseId, email)));
  }

  private async inviteOne(courseId: string, email: StudentEmail): Promise<Invite> {
    try {
      await this.requestInvitation(courseId, email);
      return { email, status: "invited" };
    } catch (failure: unknown) {
      return { email, status: inviteFailureStatus(failure) };
    }
  }

  private async requestInvitation(courseId: string, email: StudentEmail): Promise<void> {
    const response = await this.fetcher("https://classroom.googleapis.com/v1/invitations", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, userId: email.value, role: "STUDENT" }),
    });
    if (!response.ok) throw new GoogleClassroomRequestError(response.status);
    const payload: unknown = await response.json();
    googleInvitationSchema.parse(payload);
  }

  private async listCoursePage(pageToken?: string): Promise<ReadonlyArray<Course>> {
    const query = pageQuery(pageToken, { teacherId: "me", courseStates: "ACTIVE" });
    const coursePage = await this.request(`courses?${query}`, googleCourseListSchema);
    const courses = coursePage.courses.flatMap(toCourse);
    if (coursePage.nextPageToken === undefined) return courses;
    return courses.concat(await this.listCoursePage(coursePage.nextPageToken));
  }

  private async listStudentPage(courseId: string, pageToken?: string): Promise<ReadonlyArray<Student>> {
    const query = pageQuery(pageToken);
    const path = `courses/${encodeURIComponent(courseId)}/students?${query}`;
    const studentPage = await this.request(path, googleStudentListSchema);
    const students = studentPage.students.flatMap(toStudent);
    if (studentPage.nextPageToken === undefined) return students;
    return students.concat(await this.listStudentPage(courseId, studentPage.nextPageToken));
  }

  private async request<Output>(path: string, schema: Parser<Output>): Promise<Output> {
    const response = await this.fetcher(`https://classroom.googleapis.com/v1/${path}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok) throw new GoogleClassroomRequestError(response.status);
    const payload: unknown = await response.json();
    return schema.parse(payload);
  }
}

function pageQuery(pageToken?: string, values: Readonly<Record<string, string>> = {}) {
  const query = new URLSearchParams({ pageSize: "100", ...values });
  if (pageToken !== undefined) query.set("pageToken", pageToken);
  return query;
}

function toCourse(course: GoogleCourse): ReadonlyArray<Course> {
  if (course.id === undefined || course.name === undefined) return [];
  return [{ id: course.id, name: course.name, section: course.section ?? "" }];
}

function toStudent(student: GoogleStudent): ReadonlyArray<Student> {
  const profile = student.profile;
  if (profile === undefined) return [];
  if (profile.id === undefined) return [];
  if (profile.emailAddress === undefined) return [];
  return [{ id: profile.id, email: profile.emailAddress, name: studentName(profile.name) }];
}

function studentName(name: { readonly fullName?: string | undefined } | undefined): string {
  return name?.fullName ?? "";
}

interface Parser<Output> {
  readonly parse: (payload: unknown) => Output;
}

class GoogleClassroomRequestError extends Error {
  constructor(readonly statusCode: number) {
    super(`Google Classroom request failed with status ${statusCode}`);
  }
}

function inviteFailureStatus(failure: unknown): "already-invited" | "failed" {
  return failure instanceof GoogleClassroomRequestError && failure.statusCode === 409
    ? "already-invited"
    : "failed";
}
