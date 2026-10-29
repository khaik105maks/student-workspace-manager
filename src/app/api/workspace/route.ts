import type { AuthCredential } from "@/modules/auth/adapters/driving/next-auth/credential.type";

import { ZodError } from "zod";

import { createWorkspaceCase } from "@/bootstrap/workspace.factory";
import { WorkspaceResolver } from "@/modules/workspace/adapters/driving/http/workspace.resolver";
import { createCredentialService } from "@/bootstrap/credential.factory";
import { serverEnv } from "@/bootstrap/server-env.schema";

export async function GET(request: Request): Promise<Response> {
  return respond(request, false);
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ message: "Forbidden" }, { status: 403 });
  return respond(request, true);
}

async function respond(request: Request, isWrite: boolean): Promise<Response> {
  try {
    const environment = serverEnv();
    const credential = requireIdentity(await createCredentialService(environment).read(request));
    const resolver = new WorkspaceResolver(createWorkspaceCase(credential.accessToken, environment));
    const key = { owner: credential.email, spaceId: environment.chatSpaceId };
    const workspace = isWrite ? await resolver.write(key, await request.json()) : await resolver.read(key);
    return Response.json(workspace, { headers: { "Cache-Control": "no-store" } });
  } catch (failure: unknown) {
    const status = failureStatus(failure);
    return Response.json({ message: "Не вдалося оновити робочий простір. Перевірте доступ до Classroom і Chat. Попередні дані збережено." }, { status });
  }
}

function requireIdentity(credential: AuthCredential | null): AuthCredential {
  if (credential === null) throw new UnauthorizedError();
  return credential;
}

function failureStatus(failure: unknown): number {
  if (failure instanceof UnauthorizedError) return 401;
  return failure instanceof ZodError ? 400 : 502;
}

class UnauthorizedError extends Error {}
