export interface GoogleAccount {
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  readonly expiresAt: number;
}
