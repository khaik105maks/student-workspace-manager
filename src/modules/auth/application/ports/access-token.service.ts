export interface AccessTokenService {
  readonly resolve: (token: unknown) => Promise<string | null>;
}
