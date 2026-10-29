import type { ClassroomService } from "../ports/classroom.service";
import type { Invite } from "@/modules/classroom/domain/invite.value";
import { studentEmails } from "@/modules/classroom/domain/student-email.value";

export class PreviewInviteCase {
  constructor(private readonly classroomService: ClassroomService) {}

  async execute(courseId: string, rawEmails: ReadonlyArray<string>): Promise<ReadonlyArray<Invite>> {
    const students = await this.classroomService.listStudent(courseId);
    const memberEmails = new Set(students.map((student) => student.email.toLowerCase()));
    return studentEmails(rawEmails).map((email) => ({
      email,
      status: memberEmails.has(email.value) ? "already-member" : "ready",
    }));
  }
}
