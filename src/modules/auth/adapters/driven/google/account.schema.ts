import { z } from "zod";

import type { GoogleAccount } from "./account.type";

export const googleAccountSchema: z.ZodType<GoogleAccount> = z
  .object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    expires_at: z.number(),
  })
  .transform((account) => ({
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
    expiresAt: account.expires_at,
  }));
