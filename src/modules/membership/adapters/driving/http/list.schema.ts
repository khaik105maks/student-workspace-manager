import { z } from "zod";

import type { ListMemberResponse } from "./list.type";

export const listMemberResponseSchema: z.ZodType<ListMemberResponse> = z.object({
  members: z.array(
    z.object({
      identity: z.string(),
      kind: z.enum(["human", "bot", "group", "unknown"]),
      status: z.enum(["joined", "invited", "not-member", "unknown"]),
      role: z.enum(["member", "manager", "unknown"]),
    }),
  ),
});
