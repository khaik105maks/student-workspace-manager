import type { z } from "zod";
import type { GradeService } from "@/modules/classroom/application/ports/grade.service";
import type { Assignment, Submission } from "@/modules/classroom/domain/grade.value";
import { assignmentPageSchema, submissionPageSchema } from "./grade.schema";
export class GoogleGradeService implements GradeService {
  constructor(private readonly accessToken: string, private readonly fetcher: typeof fetch = fetch) {}
  async assignments(courseId: string, pageToken = ""): Promise<ReadonlyArray<Assignment>> {
    const page = assignmentPageSchema.parse(await this.request(`courses/${encodeURIComponent(courseId)}/courseWork`, pageToken));
    const assignments = page.courseWork.map(toAssignment);
    return page.nextPageToken ? assignments.concat(await this.assignments(courseId, page.nextPageToken)) : assignments;
  }
  async submissions(courseId: string, pageToken = ""): Promise<ReadonlyArray<Submission>> {
    const page = submissionPageSchema.parse(await this.request(`courses/${encodeURIComponent(courseId)}/courseWork/-/studentSubmissions`, pageToken));
    const submissions = page.studentSubmissions.map((submission) => ({
      assignmentId: submission.courseWorkId, userId: submission.userId, state: submission.state,
      grade: submission.assignedGrade ?? null, draftGrade: submission.draftGrade ?? null,
      isLate: submission.late, url: submission.alternateLink,
    }));
    return page.nextPageToken ? submissions.concat(await this.submissions(courseId, page.nextPageToken)) : submissions;
  }
  private async request(path: string, pageToken: string): Promise<unknown> {
    const query = new URLSearchParams({ pageSize: "100", pageToken });
    const response = await this.fetcher(`https://classroom.googleapis.com/v1/${path}?${query}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }, cache: "no-store",
    });
    if (!response.ok) throw new GradeRequestError(response.status);
    return response.json();
  }
}
export class GradeRequestError extends Error {
  constructor(readonly statusCode: number) { super("Classroom grades request failed"); }
}
function toAssignment(assignment: z.infer<typeof assignmentPageSchema>["courseWork"][number]): Assignment {
  return { id: assignment.id, title: assignment.title, description: assignment.description,
    url: assignment.alternateLink, maxPoints: assignment.maxPoints ?? null, deadline: deadline(assignment) };
}
function deadline(assignment: z.infer<typeof assignmentPageSchema>["courseWork"][number]): string {
  if (!assignment.dueDate) return "";
  const { year, month, day } = assignment.dueDate;
  return new Date(Date.UTC(year, month - 1, day, ...deadlineTime(assignment.dueTime))).toISOString();
}

function deadlineTime(time: { readonly hours?: number | undefined; readonly minutes?: number | undefined } | undefined): [number, number] {
  return [time?.hours ?? 0, time?.minutes ?? 0];
}
