import { getToken } from "next-auth/jwt";

import type { AccessTokenService } from "@/modules/auth/application/ports/access-token.service";
import { isAllowedEmail } from "@/modules/auth/domain/email.policy";

import { credentialSchema } from "./credential.schema";
import type { AuthCredential } from "./credential.type";

export class CredentialService {
  constructor(
    private readonly secret: string,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async read(request: Request): Promise<AuthCredential | null> {
    const token = await getToken({ req: request, secret: this.secret });
    const parsedCredential = credentialSchema.safeParse(token);
    if (!parsedCredential.success) return null;
    if (!isAllowedEmail(parsedCredential.data.email)) return null;
    const accessToken = await this.accessTokenService.resolve(token);
    if (accessToken === null) return null;
    return { accessToken, email: parsedCredential.data.email };
  }
}
