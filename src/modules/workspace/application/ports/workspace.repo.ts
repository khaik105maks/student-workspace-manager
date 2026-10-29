import type { SyncSnapshot, WorkspaceState } from "@/modules/workspace/domain/sync.value";

export interface WorkspaceKey { readonly owner: string; readonly spaceId: string; }
export interface WorkspaceRepo {
  readonly read: (key: WorkspaceKey) => Promise<WorkspaceState>;
  readonly select: (key: WorkspaceKey, courseId: string) => Promise<void>;
  readonly save: (key: WorkspaceKey, snapshot: SyncSnapshot) => Promise<void>;
}
