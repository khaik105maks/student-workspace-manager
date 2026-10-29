import { z } from "zod";

import type { WorkspaceState } from "@/modules/workspace/domain/sync.value";

export const workspaceStateSchema: z.ZodType<WorkspaceState> = z.object({
  courseId: z.string(),
  snapshot: z.object({
    courseId: z.string(), spaceId: z.string(), savedAt: z.string(),
    invitations: z.array(z.object({ id: z.string(), userId: z.string(), email: z.string() })).optional(),
    courses: z.array(z.object({ id: z.string(), name: z.string(), section: z.string() })),
    students: z.array(z.object({ id: z.string(), email: z.string(), name: z.string() })),
    members: z.array(z.object({ identity: z.string(), kind: z.string(), status: z.string(), role: z.string() })),
  }).nullable(),
});
export const workspaceRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("select"), courseId: z.string().trim().min(1), isHumanConfirmed: z.literal(true) }),
  z.object({ action: z.literal("sync"), isHumanConfirmed: z.literal(true) }),
]);
