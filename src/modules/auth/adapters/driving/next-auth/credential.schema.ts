import { z } from "zod";

import type { AuthIdentity } from "./credential.type";

export const credentialSchema: z.ZodType<AuthIdentity> = z.object({
  email: z.email(),
});
