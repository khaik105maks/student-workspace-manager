import { z } from "zod";

import type { CheckMemberRequest, CheckMemberResponse } from "./check.type";

export const checkMemberSchema: z.ZodType<CheckMemberRequest> = z.object({
  emails: z.array(z.string()).min(1).max(500),
});

export const checkMemberResponseSchema: z.ZodType<CheckMemberResponse> = z.object({
  memberships: z.array(
    z.object({
      email: z.email(),
      status: z.enum(["joined", "invited", "not-member", "unknown"]),
    }),
  ),
});
