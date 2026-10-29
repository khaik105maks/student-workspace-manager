import { SqliteWorkspaceRepo } from "@/modules/workspace/adapters/driven/repo/sqlite-workspace.repo";
import { SyncWorkspaceCase } from "@/modules/workspace/application/use-cases/sync-workspace.case";

import { ClassroomFactory } from "./classroom.factory";
import { MembershipFactory } from "./membership.factory";
import type { ServerEnv } from "./server-env.type";

export function createWorkspaceCase(accessToken: string, environment: ServerEnv) {
  const classroom = new ClassroomFactory({ accessToken, auditPath: environment.auditPath });
  const membership = new MembershipFactory({ accessToken, auditPath: environment.auditPath, logLevel: environment.logLevel });
  return new SyncWorkspaceCase(new SqliteWorkspaceRepo("data/classroom.sqlite"), {
    courses: () => classroom.createListCourseCase().execute(),
    students: (courseId) => classroom.createListStudentCase().execute(courseId),
    members: (spaceId) => membership.createListMemberCase().execute(spaceId),
    invitations: (courseId) => classroom.createInvitationService().list(courseId),
    now: () => new Date().toISOString(),
  });
}
