import { z } from "zod";

import type { CheckMemberRequest } from "./check.type";

export const checkMemberSchema: z.ZodType<CheckMemberRequest> = z.object({
  spaceId: z.string().startsWith("spaces/"),
  emails: z.array(z.string()).min(1).max(500),
});
