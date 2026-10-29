import type { SyncWorkspaceCase } from "@/modules/workspace/application/use-cases/sync-workspace.case";
import type { WorkspaceKey } from "@/modules/workspace/application/ports/workspace.repo";

import { workspaceRequestSchema } from "./workspace.schema";

export class WorkspaceResolver {
  constructor(private readonly sync: SyncWorkspaceCase) {}
  read(key: WorkspaceKey) { return this.sync.read(key); }
  write(key: WorkspaceKey, payload: unknown) {
    const request = workspaceRequestSchema.parse(payload);
    if (request.action === "select") return this.sync.select(key, request.courseId, request.isHumanConfirmed);
    return this.sync.execute(key, request.isHumanConfirmed);
  }
}
