import type { AccessTokenService } from "@/modules/auth/application/ports/access-token.service";

import { refreshedGoogleTokenSchema, storedGoogleTokenSchema } from "./access-token.schema";
import type { GoogleTokenConfig, StoredGoogleToken } from "./access-token.type";

const EXPIRATION_MARGIN_MS = 60_000;

export class GoogleAccessTokenService implements AccessTokenService {
  constructor(
    private readonly config: GoogleTokenConfig,
    private readonly fetcher: typeof fetch = fetch,
    private readonly now: () => number = Date.now,
  ) {}

  async resolve(token: unknown): Promise<string | null> {
    const parsedToken = storedGoogleTokenSchema.safeParse(token);
    if (!parsedToken.success) return null;
    if (this.isActive(parsedToken.data)) return parsedToken.data.accessToken;
    return this.refresh(parsedToken.data.refreshToken);
  }

  private isActive(token: StoredGoogleToken): boolean {
    return token.accessTokenExpiresAt * 1_000 > this.now() + EXPIRATION_MARGIN_MS;
  }

  private async refresh(refreshToken: string | undefined): Promise<string | null> {
    if (refreshToken === undefined) return null;
    const response = await this.fetcher("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: this.refreshRequest(refreshToken),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const refreshedToken = refreshedGoogleTokenSchema.safeParse(payload);
    return refreshedToken.success ? refreshedToken.data.accessToken : null;
  }

  private refreshRequest(refreshToken: string): URLSearchParams {
    return new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
  }
}
