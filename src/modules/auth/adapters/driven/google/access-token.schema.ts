import { z } from "zod";

import type { RefreshedGoogleToken, StoredGoogleToken } from "./access-token.type";

export const storedGoogleTokenSchema: z.ZodType<StoredGoogleToken> = z
  .object({
    accessToken: z.string().min(1),
    accessTokenExpiresAt: z.number(),
    refreshToken: z.string().min(1).optional(),
  })
  .transform((token) => ({
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    refreshToken: token.refreshToken,
  }));

export const refreshedGoogleTokenSchema: z.ZodType<RefreshedGoogleToken> = z
  .object({ access_token: z.string().min(1) })
  .transform((token) => ({ accessToken: token.access_token }));
