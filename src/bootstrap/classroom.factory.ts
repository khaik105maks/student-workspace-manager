import { GoogleGradeService } from "@/modules/classroom/adapters/driven/google/grade.service";
import { ReadGradeCase } from "@/modules/classroom/application/use-cases/read-grade.case";
import { GradeResolver } from "@/modules/classroom/adapters/driving/http/grade.resolver";
import { GoogleInvitationService } from "@/modules/classroom/adapters/driven/google/invitation.service";
import { RenewInviteCase } from "@/modules/classroom/application/use-cases/renew-invite.case";
import { ImportRosterCase } from "@/modules/classroom/application/use-cases/import-roster.case";
import { ImportRosterResolver } from "@/modules/classroom/adapters/driving/http/import-roster.resolver";
import { SqliteRosterRepo } from "@/modules/classroom/adapters/driven/repo/sqlite-roster.repo";
import { SaveRosterCase } from "@/modules/classroom/application/use-cases/save-roster.case";
import { RosterResolver } from "@/modules/classroom/adapters/driving/http/roster.resolver";
import { GoogleClassroomService } from "@/modules/classroom/adapters/driven/google/classroom.service";
import { ListCourseCase } from "@/modules/classroom/application/use-cases/list-course.case";
import { ListStudentCase } from "@/modules/classroom/application/use-cases/list-student.case";
import { InviteStudentCase } from "@/modules/classroom/application/use-cases/invite-student.case";
import { PreviewInviteCase } from "@/modules/classroom/application/use-cases/preview-invite.case";
import { JsonlInviteAuditRepo } from "@/modules/classroom/adapters/driven/repo/jsonl-invite-audit.repo";
import { SystemClockService } from "@/modules/classroom/adapters/driven/system-clock.service";

export interface ClassroomConfig {
  readonly accessToken: string;
  readonly auditPath: string;
}

export class ClassroomFactory {
  constructor(private readonly config: ClassroomConfig) {}

  createGradeResolver() { return new GradeResolver(new ReadGradeCase(new GoogleGradeService(this.config.accessToken), this.createClassroomService())); }

  createInvitationService() { return new GoogleInvitationService(this.config.accessToken); }

  createRenewInviteCase() {
    return new RenewInviteCase({ classroom: this.createClassroomService(), invitations: this.createInvitationService(), audit: new JsonlInviteAuditRepo(this.config.auditPath), clock: new SystemClockService() });
  }

  createImportRosterResolver(): ImportRosterResolver {
    return new ImportRosterResolver(new ImportRosterCase(new SqliteRosterRepo("data/classroom.sqlite"), new SystemClockService()));
  }

  createRosterResolver(): RosterResolver {
    const repo = new SqliteRosterRepo("data/classroom.sqlite");
    return new RosterResolver(repo, new SaveRosterCase(this.createClassroomService(), repo, new SystemClockService()));
  }

  createListCourseCase(): ListCourseCase {
    return new ListCourseCase(this.createClassroomService());
  }

  createListStudentCase(): ListStudentCase {
    return new ListStudentCase(this.createClassroomService());
  }

  createPreviewInviteCase(): PreviewInviteCase {
    return new PreviewInviteCase(this.createClassroomService());
  }

  createInviteStudentCase(): InviteStudentCase {
    return new InviteStudentCase(
      this.createClassroomService(),
      new JsonlInviteAuditRepo(this.config.auditPath),
      new SystemClockService(),
    );
  }

  private createClassroomService(): GoogleClassroomService {
    return new GoogleClassroomService(this.config.accessToken);
  }
}
