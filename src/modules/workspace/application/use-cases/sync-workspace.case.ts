import type { WorkspaceKey, WorkspaceRepo } from "../ports/workspace.repo";
import type { SourceService } from "../ports/source.service";

export class SyncWorkspaceCase {
  constructor(private readonly repo: WorkspaceRepo, private readonly source: SourceService) {}

  read(key: WorkspaceKey) { return this.repo.read(key); }

  async select(key: WorkspaceKey, courseId: string, isConfirmed: boolean) {
    requireConfirmation(isConfirmed);
    await this.repo.select(key, courseId);
    return this.repo.read(key);
  }

  async execute(key: WorkspaceKey, isConfirmed: boolean) {
    requireConfirmation(isConfirmed);
    const { courseId } = await this.repo.read(key);
    if (!courseId) throw new Error("Спочатку оберіть курс.");
    const [courses, students, members, invitations] = await Promise.all([this.source.courses(), this.source.students(courseId), this.source.members(key.spaceId), this.source.invitations(courseId)]);
    const snapshot = { courseId, spaceId: key.spaceId, courses, students, members, invitations, savedAt: this.source.now() };
    await this.repo.save(key, snapshot);
    return this.repo.read(key);
  }
}

function requireConfirmation(isConfirmed: boolean) {
  if (!isConfirmed) throw new Error("Потрібне підтвердження користувача.");
}
