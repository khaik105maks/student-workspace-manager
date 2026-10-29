import type { ClassroomService } from "../ports/classroom.service";
import type { ClockService } from "../ports/clock.service";
import type { InviteAuditRepo } from "../ports/invite-audit.repo";
import { requireHumanConfirmation } from "@/modules/classroom/domain/confirmation.policy";
import type { Invite } from "@/modules/classroom/domain/invite.value";
import { studentEmails } from "@/modules/classroom/domain/student-email.value";

export interface InviteStudentCommand {
  readonly actorEmail: string;
  readonly courseId: string;
  readonly rawEmails: ReadonlyArray<string>;
  readonly isHumanConfirmed: boolean;
}

export class InviteStudentCase {
  constructor(
    private readonly classroomService: ClassroomService,
    private readonly auditRepo: InviteAuditRepo,
    private readonly clockService: ClockService,
  ) {}

  async execute(command: InviteStudentCommand): Promise<ReadonlyArray<Invite>> {
    requireHumanConfirmation(command.isHumanConfirmed);
    const missingEmails = await this.missingEmails(command.courseId, command.rawEmails);
    const invitations = await this.classroomService.inviteStudent(command.courseId, missingEmails);
    await this.auditRepo.append({ action: "student-invite", actorEmail: command.actorEmail, courseId: command.courseId, invitations, occurredAt: this.clockService.now() });
    return invitations;
  }

  private async missingEmails(courseId: string, rawEmails: ReadonlyArray<string>) {
    const students = await this.classroomService.listStudent(courseId);
    const memberEmails = new Set(students.map((student) => student.email.toLowerCase()));
    return studentEmails(rawEmails).filter((email) => !memberEmails.has(email.value));
  }
}
