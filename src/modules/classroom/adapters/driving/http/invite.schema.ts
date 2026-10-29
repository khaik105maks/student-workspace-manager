import { z } from "zod";

import type { ExecuteInviteRequest, InviteRequest, InviteResponse } from "./invite.type";

export const inviteRequestSchema: z.ZodType<InviteRequest> = z.object({
  courseId: z.string().min(1),
  emails: z.array(z.string()).min(1).max(500),
});

export const executeInviteSchema: z.ZodType<ExecuteInviteRequest> = z.object({
  courseId: z.string().min(1),
  emails: z.array(z.string()).min(1).max(500),
  isHumanConfirmed: z.literal(true),
});

export const inviteResponseSchema: z.ZodType<InviteResponse> = z.object({
  invitations: z.array(z.object({
    email: z.email(),
    status: z.enum(["ready", "already-member", "invited", "already-invited", "failed"]),
  })),
});
