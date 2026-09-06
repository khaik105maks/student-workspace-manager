import { GoogleAccessTokenService } from "@/modules/auth/adapters/driven/google/access-token.service";
import { CredentialService } from "@/modules/auth/adapters/driving/next-auth/credential.service";

import type { ServerEnv } from "./server-env.type";

export function createCredentialService(environment: ServerEnv): CredentialService {
  const accessTokenService = new GoogleAccessTokenService({
    clientId: environment.googleClientId,
    clientSecret: environment.googleClientSecret,
  });
  return new CredentialService(environment.authSecret, accessTokenService);
}
