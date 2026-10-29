import { createCredentialService } from "@/bootstrap/credential.factory";
import { MembershipFactory } from "@/bootstrap/membership.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";
import { ListMemberResolver } from "@/modules/membership/adapters/driving/http/list.resolver";

export async function GET(request: Request): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = await requireCredential(request, environment);
    const members = await createResolver(credential.accessToken, environment).resolve();
    return Response.json({ members });
  } catch (failure: unknown) {
    return failureResponse(failure);
  }
}

async function requireCredential(request: Request, environment: ReturnType<typeof serverEnv>) {
  const credential = await createCredentialService(environment).read(request);
  if (credential === null) throw new UnauthorizedError();
  return credential;
}

function createResolver(accessToken: string, environment: ReturnType<typeof serverEnv>) {
  const factory = new MembershipFactory({
    accessToken,
    auditPath: environment.auditPath,
    logLevel: environment.logLevel,
  });
  return new ListMemberResolver(factory.createListMemberCase(), environment.chatSpaceId);
}

function failureResponse(failure: unknown): Response {
  if (failure instanceof UnauthorizedError) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ message: "Membership list failed" }, { status: 502 });
}

class UnauthorizedError extends Error {}
