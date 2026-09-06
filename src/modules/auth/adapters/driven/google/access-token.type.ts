export interface GoogleTokenConfig {
  readonly clientId: string;
  readonly clientSecret: string;
}

export interface StoredGoogleToken {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: number;
  readonly refreshToken: string | undefined;
}

export interface RefreshedGoogleToken {
  readonly accessToken: string;
}
