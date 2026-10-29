import { requireHumanConfirmation } from "@/modules/classroom/domain/confirmation.policy";
import { StudentEmail } from "@/modules/classroom/domain/student-email.value";
import type { ClassroomService } from "../ports/classroom.service";
import type { InvitationService } from "../ports/invitation.service";
import type { InviteAuditRepo } from "../ports/invite-audit.repo";
import type { ClockService } from "../ports/clock.service";

interface RenewCommand { readonly actorEmail: string; readonly courseId: string; readonly email: string; readonly isHumanConfirmed: boolean; }
interface RenewDependencies { readonly classroom: ClassroomService; readonly invitations: InvitationService; readonly audit: InviteAuditRepo; readonly clock: ClockService; }

export class RenewInviteCase {
  constructor(private readonly dependencies: RenewDependencies) {}
  async execute(command: RenewCommand): Promise<string> {
    requireHumanConfirmation(command.isHumanConfirmed);
    const email = StudentEmail.create(command.email);
    const students = await this.dependencies.classroom.listStudent(command.courseId);
    if (students.some((student) => student.email.toLowerCase() === email.value)) return "already-member";
    const pending = await this.dependencies.invitations.list(command.courseId, email.value);
    await this.record(command, "invite-renew-started");
    await this.removePending(command, pending.map((invitation) => invitation.id));
    return this.create(command);
  }
  private async removePending(command: RenewCommand, ids: ReadonlyArray<string>) {
    await ids.reduce<Promise<void>>(async (previous, id) => {
      await previous;
      await this.dependencies.invitations.remove(id);
      await this.record(command, "invite-deleted");
    }, Promise.resolve());
  }
  private async create(command: RenewCommand): Promise<string> {
    try { await this.dependencies.invitations.create(command.courseId, command.email); }
    catch { await this.record(command, "invite-create-failed"); return "failed"; }
    await this.record(command, "invite-created");
    return "invited";
  }
  private record(command: RenewCommand, action: "invite-renew-started" | "invite-deleted" | "invite-created" | "invite-create-failed") {
    return this.dependencies.audit.append({ action, actorEmail: command.actorEmail, courseId: command.courseId, invitations: [{ email: StudentEmail.create(command.email), status: "ready" }], occurredAt: this.dependencies.clock.now() });
  }
}
