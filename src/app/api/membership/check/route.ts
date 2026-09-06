import { ZodError } from "zod";

import { createCredentialService } from "@/bootstrap/credential.factory";
import { MembershipFactory } from "@/bootstrap/membership.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";
import { CheckMemberResolver } from "@/modules/membership/adapters/driving/http/check.resolver";

export async function POST(request: Request): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = await requireCredential(request, environment);
    const payload: unknown = await request.json();
    const memberships = await createResolver(credential.accessToken, environment).resolve(payload);
    return Response.json({ memberships });
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
  return new CheckMemberResolver(factory.createCheckMemberCase());
}

function failureResponse(failure: unknown): Response {
  if (failure instanceof UnauthorizedError) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (failure instanceof ZodError) {
    return Response.json({ message: "Invalid membership request" }, { status: 400 });
  }
  return Response.json({ message: "Membership check failed" }, { status: 502 });
}

class UnauthorizedError extends Error {}
