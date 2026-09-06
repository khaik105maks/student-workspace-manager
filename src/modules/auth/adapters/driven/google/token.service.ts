import { googleAccountSchema } from "./account.schema";
import type { AuthToken } from "./token.type";

export function mergeGoogleAccount(token: AuthToken, account: unknown): AuthToken {
  const parsedAccount = googleAccountSchema.safeParse(account);
  if (!parsedAccount.success) return token;
  return {
    ...token,
    accessToken: parsedAccount.data.accessToken,
    accessTokenExpiresAt: parsedAccount.data.expiresAt,
    ...refreshTokenField(parsedAccount.data.refreshToken),
  };
}

function refreshTokenField(refreshToken: string | undefined): Record<string, string> {
  if (refreshToken === undefined) return {};
  return { refreshToken };
}
